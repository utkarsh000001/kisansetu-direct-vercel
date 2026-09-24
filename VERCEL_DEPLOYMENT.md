# KisanSetu Direct — Vercel Deployment

## Import the repository

1. Open the Vercel dashboard and choose **Add New Project**.
2. Import `utkarsh000001/kisansetu-direct-vercel`.
3. Vercel should detect the included `vercel.json` configuration.
4. Keep the build command as `pnpm build` and the output directory as `dist/public`.
5. Deploy the project.

## Required environment variables

Add the following values in **Vercel → Project Settings → Environment Variables**. Use separate values for Preview and Production where appropriate.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string used by Drizzle. |
| `JWT_SECRET` | Secret used to sign session cookies. |
| `VITE_APP_ID` | Manus OAuth application ID. |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL. |
| `VITE_OAUTH_PORTAL_URL` | Frontend login portal URL. |
| `OWNER_OPEN_ID` | Owner identity used for admin assignment. |
| `OWNER_NAME` | Owner display name. |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API base URL, if using storage or other built-ins. |
| `BUILT_IN_FORGE_API_KEY` | Server-side Manus built-in API key. |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Manus built-in API URL, if required. |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Manus built-in API key, if required. |

Do not commit `.env` files or secret values to GitHub.

## OAuth callback

After Vercel assigns a production domain, add the production callback URL required by the Manus OAuth application. The callback path is:

```text
https://YOUR_VERCEL_DOMAIN/api/oauth/callback
```

Use the exact production domain configured in Vercel.

## Verify the deployment

After deployment, verify:

- The home page loads and client-side routes work on refresh.
- `/api/trpc` requests reach the serverless API.
- OAuth login redirects to the correct production callback.
- Database-backed operations work with the production `DATABASE_URL`.
- Preview and production environment variables are configured separately.

The repository includes `api/index.ts`, which adapts the Express/tRPC server to Vercel's serverless Node runtime, and `vercel.json`, which configures the build, static output, API function, and SPA fallback.
