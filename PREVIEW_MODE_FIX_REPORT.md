# Preview Mode Fix Report

## Summary
Fixed preview mode to use cookie-based context instead of searchParams, ensuring branding applies globally across Topbar/Sidebar/AppShell.

## Files Changed

### New Files
1. **`lib/preview.ts`** - Cookie-based preview context utilities
   - `getActivePreviewId()` - Reads preview cookie server-side
   - `setActivePreviewId()` - Sets preview cookie (server-side)
   - `clearActivePreviewId()` - Clears preview cookie (server-side)

2. **`app/api/preview/enter/route.ts`** - API route to enter preview mode
   - Validates user session and org membership
   - Validates preview workspace belongs to active org
   - Sets `preview-workspace-id` cookie
   - Redirects to `/app` (no query string)

3. **`app/api/preview/exit/route.ts`** - API route to exit preview mode
   - Clears `preview-workspace-id` cookie
   - Returns `{ ok: true }`

4. **`app/api/preview/status/route.ts`** - API route to check preview status (for client-side checks)

### Modified Files
1. **`middleware.ts`**
   - Added canonicalization: `/app?preview=<id>` → `/api/preview/enter?id=<id>`
   - Ensures preview query params are converted to cookie-based context

2. **`lib/data/supabase.ts`**
   - `getKPIs()` - Now reads preview ID from cookie internally (removed `previewWorkspaceId` param)
   - `getAlerts()` - Now reads preview ID from cookie internally (removed `previewWorkspaceId` param)

3. **`lib/data/index.ts`**
   - Updated `getKPIs()` and `getAlerts()` signatures to remove preview params
   - Data adapters now resolve preview context internally

4. **`lib/branding/server.ts`**
   - `getBrandingForActiveOrg()` - Now reads preview ID from cookie internally
   - Automatically resolves preview-specific branding when preview mode is active

5. **`app/app/layout.tsx`**
   - Resolves preview ID from cookie server-side
   - Passes `previewId` prop to `PreviewBanner` component

6. **`components/app-shell/PreviewBanner.tsx`**
   - Now accepts `previewId` prop from server
   - `handleExit()` calls `POST /api/preview/exit` and refreshes route
   - Removed client-side searchParams dependency

7. **`app/app/page.tsx`**
   - Removed `searchParams` dependency
   - Data fetching now uses cookie-based preview context

8. **`lib/actions/preview-actions.ts`**
   - Updated comment to indicate client will redirect to `/api/preview/enter`

9. **`app/app/sales/preview/preview-wizard.tsx`**
   - Updated redirect to use `/api/preview/enter?id=<id>` instead of `/app?preview=<id>`

## Implementation Details

### Cookie Configuration
- **Name**: `preview-workspace-id`
- **httpOnly**: `true` (security)
- **secure**: `true` in production
- **sameSite**: `lax`
- **maxAge**: 7 days
- **path**: `/app`

### Preview Flow
1. User creates preview workspace via `/app/sales/preview`
2. Wizard redirects to `/api/preview/enter?id=<previewId>`
3. API route validates and sets cookie, redirects to `/app`
4. All data adapters read preview ID from cookie automatically
5. Branding resolves preview-specific branding when cookie is set
6. User clicks "Exit Preview" → calls `/api/preview/exit` → cookie cleared → branding restored

### Middleware Canonicalization
- Any `/app?preview=<id>` URLs are automatically redirected to `/api/preview/enter?id=<id>`
- Ensures all preview entry points use the same canonical flow
- Prevents searchParams from persisting in URLs

## Testing Checklist

- [ ] Enter preview: Cookie set correctly
- [ ] Branding applied globally: Topbar/Sidebar show preview branding
- [ ] Data filtered: KPIs and alerts show preview data
- [ ] Exit preview: Cookie cleared, org branding restored
- [ ] Normal org mode: Still works without preview
- [ ] Demo org protections: Still hold (read-only)
- [ ] `npm run audit:nav`: PASS
- [ ] `npm run audit:actions`: PASS
- [ ] `npm run build`: PASS

## Validation Steps

1. **Apply migrations**: Ensure `009_preview_workspaces.sql` is applied
2. **Restart dev server**: `PORT=3005 npm run dev`
3. **Hard refresh**: Cmd+Shift+R
4. **Test preview generation**:
   - Navigate to `/app/sales/preview`
   - Create preview workspace
   - Verify redirect to `/app` (no query string)
   - Verify cookie is set (check DevTools → Application → Cookies)
5. **Test preview mode**:
   - Verify "PREVIEW MODE" banner appears
   - Verify Topbar logo/colors changed to preview branding
   - Verify Sidebar mark/wordmark branded
   - Verify KPIs show preview data
   - Verify alerts show preview data
6. **Test exit preview**:
   - Click "Exit Preview"
   - Verify cookie is cleared
   - Verify org branding restored immediately
   - Verify data shows org data (not preview)
7. **Run audits**:
   - `npm run audit:nav`
   - `npm run audit:actions`
   - `npm run build`




