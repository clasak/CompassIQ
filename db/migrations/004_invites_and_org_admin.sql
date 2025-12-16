-- ============================================================
-- 004_invites_and_org_admin.sql
-- Organization invitations and admin management
-- ============================================================

-- ORG INVITES TABLE
CREATE TABLE org_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email text NOT NULL,
    role role_enum NOT NULL DEFAULT 'VIEWER',
    token text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    accepted_at timestamptz,
    accepted_by uuid,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_org_invites_org_email ON org_invites(org_id, email);
CREATE INDEX idx_org_invites_token ON org_invites(token);
CREATE INDEX idx_org_invites_org_id ON org_invites(org_id);

-- UPDATED_AT TRIGGER
CREATE TRIGGER update_org_invites_updated_at BEFORE UPDATE ON org_invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ORG_INVITES
-- SELECT: members of org can view invites
CREATE POLICY "org_invites_select" ON org_invites
    FOR SELECT USING (is_member(org_id));

-- INSERT: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_invites_insert" ON org_invites
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- UPDATE: only OWNER/ADMIN and NOT demo org (but invite acceptance is handled via RPC)
CREATE POLICY "org_invites_update" ON org_invites
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- DELETE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_invites_delete" ON org_invites
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- SECURITY DEFINER RPC: CREATE INVITE
CREATE OR REPLACE FUNCTION create_invite(
    p_org_id uuid,
    p_email text,
    p_role role_enum
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_user_role role_enum;
    v_is_demo boolean;
    v_invite_id uuid;
    v_token text;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    -- Verify user is member of org
    SELECT role INTO v_user_role
    FROM memberships
    WHERE org_id = p_org_id AND user_id = v_user_id
    LIMIT 1;

    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'not a member of this organization';
    END IF;

    -- Verify user is OWNER or ADMIN
    IF v_user_role NOT IN ('OWNER', 'ADMIN') THEN
        RAISE EXCEPTION 'insufficient privileges: OWNER or ADMIN required';
    END IF;

    -- Verify not demo org
    SELECT is_demo INTO v_is_demo
    FROM organizations
    WHERE id = p_org_id;

    IF v_is_demo THEN
        RAISE EXCEPTION 'cannot create invites for demo organization';
    END IF;

    -- Generate secure random token
    v_token := encode(gen_random_bytes(32), 'base64');

    -- Insert invite
    INSERT INTO org_invites (org_id, email, role, token, created_by, expires_at)
    VALUES (p_org_id, p_email, p_role, v_token, v_user_id, now() + interval '7 days')
    RETURNING id INTO v_invite_id;

    RETURN v_invite_id;
END;
$$;

-- SECURITY DEFINER RPC: ACCEPT INVITE
CREATE OR REPLACE FUNCTION accept_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_invite_record RECORD;
    v_org_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    -- Lookup invite by token
    SELECT id, org_id, email, role, accepted_at, expires_at
    INTO v_invite_record
    FROM org_invites
    WHERE token = p_token
    LIMIT 1;

    IF v_invite_record.id IS NULL THEN
        RAISE EXCEPTION 'invalid invite token';
    END IF;

    -- Check if already accepted
    IF v_invite_record.accepted_at IS NOT NULL THEN
        RAISE EXCEPTION 'invite has already been accepted';
    END IF;

    -- Check if expired
    IF v_invite_record.expires_at < now() THEN
        RAISE EXCEPTION 'invite has expired';
    END IF;

    v_org_id := v_invite_record.org_id;

    -- Create membership if not exists
    INSERT INTO memberships (org_id, user_id, role)
    VALUES (v_org_id, v_user_id, v_invite_record.role)
    ON CONFLICT (org_id, user_id) DO UPDATE
    SET role = v_invite_record.role, updated_at = now();

    -- Mark invite as accepted
    UPDATE org_invites
    SET accepted_at = now(),
        accepted_by = v_user_id
    WHERE id = v_invite_record.id;

    RETURN v_org_id;
END;
$$;

-- SECURITY DEFINER RPC: UPDATE MEMBER ROLE
CREATE OR REPLACE FUNCTION update_member_role(
    p_org_id uuid,
    p_user_id uuid,
    p_role role_enum
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_requester_id uuid;
    v_requester_role role_enum;
    v_is_demo boolean;
    v_current_owner_count integer;
BEGIN
    v_requester_id := auth.uid();
    IF v_requester_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    -- Verify requester is member of org
    SELECT role INTO v_requester_role
    FROM memberships
    WHERE org_id = p_org_id AND user_id = v_requester_id
    LIMIT 1;

    IF v_requester_role IS NULL THEN
        RAISE EXCEPTION 'not a member of this organization';
    END IF;

    -- Verify not demo org
    SELECT is_demo INTO v_is_demo
    FROM organizations
    WHERE id = p_org_id;

    IF v_is_demo THEN
        RAISE EXCEPTION 'cannot modify roles in demo organization';
    END IF;

    -- Only OWNER can assign OWNER role
    IF p_role = 'OWNER' AND v_requester_role != 'OWNER' THEN
        RAISE EXCEPTION 'only OWNER can assign OWNER role';
    END IF;

    -- Verify requester is OWNER or ADMIN
    IF v_requester_role NOT IN ('OWNER', 'ADMIN') THEN
        RAISE EXCEPTION 'insufficient privileges: OWNER or ADMIN required';
    END IF;

    -- Prevent removing last OWNER (if changing from OWNER to something else)
    IF EXISTS (
        SELECT 1 FROM memberships
        WHERE org_id = p_org_id AND user_id = p_user_id AND role = 'OWNER'
    ) AND p_role != 'OWNER' THEN
        SELECT COUNT(*) INTO v_current_owner_count
        FROM memberships
        WHERE org_id = p_org_id AND role = 'OWNER';

        IF v_current_owner_count <= 1 THEN
            RAISE EXCEPTION 'cannot remove the last OWNER from organization';
        END IF;
    END IF;

    -- Update role
    UPDATE memberships
    SET role = p_role, updated_at = now()
    WHERE org_id = p_org_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'membership not found';
    END IF;
END;
$$;


