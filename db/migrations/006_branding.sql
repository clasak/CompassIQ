-- ============================================================
-- 006_branding.sql
-- Per-organization branding (name, logos, colors) + Storage policies
-- ============================================================

-- ORG BRANDING TABLE
CREATE TABLE IF NOT EXISTS org_branding (
    org_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    brand_name text NOT NULL DEFAULT 'CompassIQ',
    tagline text,
    logo_light_url text,
    logo_dark_url text,
    mark_url text,
    primary_color text NOT NULL DEFAULT '#0A192F',
    accent_color text NOT NULL DEFAULT '#007BFF',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS update_org_branding_updated_at ON org_branding;
CREATE TRIGGER update_org_branding_updated_at BEFORE UPDATE ON org_branding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE org_branding ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ORG_BRANDING
DROP POLICY IF EXISTS "org_branding_select" ON org_branding;
DROP POLICY IF EXISTS "org_branding_insert" ON org_branding;
DROP POLICY IF EXISTS "org_branding_update" ON org_branding;
DROP POLICY IF EXISTS "org_branding_delete" ON org_branding;

-- SELECT: members can read branding
CREATE POLICY "org_branding_select" ON org_branding
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = org_branding.org_id AND m.user_id = auth.uid()
        )
    );

-- INSERT: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_branding_insert" ON org_branding
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- UPDATE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_branding_update" ON org_branding
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- DELETE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_branding_delete" ON org_branding
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- PUBLIC BRANDING LOOKUP (for login page display without auth)
-- Returns only non-sensitive branding fields and merges defaults when org_branding row is missing.
CREATE OR REPLACE FUNCTION get_public_branding(p_org_slug text)
RETURNS TABLE (
    brand_name text,
    tagline text,
    logo_light_url text,
    logo_dark_url text,
    mark_url text,
    primary_color text,
    accent_color text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id uuid;
BEGIN
    SELECT id INTO v_org_id
    FROM organizations
    WHERE slug = p_org_slug
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        COALESCE(ob.brand_name, 'CompassIQ') AS brand_name,
        ob.tagline,
        ob.logo_light_url,
        ob.logo_dark_url,
        ob.mark_url,
        COALESCE(ob.primary_color, '#0A192F') AS primary_color,
        COALESCE(ob.accent_color, '#007BFF') AS accent_color
    FROM org_branding ob
    WHERE ob.org_id = v_org_id;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            'CompassIQ'::text AS brand_name,
            NULL::text AS tagline,
            NULL::text AS logo_light_url,
            NULL::text AS logo_dark_url,
            NULL::text AS mark_url,
            '#0A192F'::text AS primary_color,
            '#007BFF'::text AS accent_color;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_branding(text) TO anon, authenticated;

-- ============================================================
-- SUPABASE STORAGE: brand-assets bucket + org-scoped policies
-- ============================================================

-- Create bucket (public for simple logo rendering; assets are org-scoped by path + policy)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Safe UUID parsing helper for Storage RLS expressions
CREATE OR REPLACE FUNCTION safe_uuid(p_text text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN p_text::uuid;
EXCEPTION WHEN others THEN
    RETURN NULL;
END;
$$;

-- Storage object policies for org-scoped brand assets
DROP POLICY IF EXISTS "brand_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "brand_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "brand_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "brand_assets_delete" ON storage.objects;

CREATE POLICY "brand_assets_select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "brand_assets_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    );

CREATE POLICY "brand_assets_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    )
    WITH CHECK (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    );

CREATE POLICY "brand_assets_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    );
