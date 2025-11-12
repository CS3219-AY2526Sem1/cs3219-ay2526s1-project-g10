# Cloud Run Deployment Guide

This project ships six containers (frontend, API gateway, user-service, question-service, matching-service, collab-service). The GitHub Actions workflow at `.github/workflows/deploy-cloudrun.yaml` builds their Docker images, pushes them to Artifact Registry, and deploys each revision directly to Cloud Run—no Cloud Build required.

Follow the steps below to provision Google Cloud resources, wire up secrets, and run the deployment.

## 1. Prerequisites

1. **Google Cloud project** with billing enabled and APIs:
   - Cloud Run Admin API
   - Artifact Registry API
   - Secret Manager API
   - (Optional) Serverless VPC Access API if you plan to attach a VPC connector
2. **Artifact Registry** repository (Docker format) in your deployment region, e.g.
   ```bash
   gcloud artifacts repositories create containers \
     --project=${PROJECT_ID} \
     --repository=containers \
     --repository-format=docker \
     --location=${REGION}
   ```
3. **Service account** that will own Cloud Run revisions (runtime) with at least:
   - `roles/run.invoker`
   - `roles/run.serviceAgent`
   - `roles/secretmanager.secretAccessor`
   - Any additional roles required by downstream services (e.g. to access VPC connector)
4. **GitHub Actions Workload Identity Federation**:
   - Create a workload identity pool + provider bound to your GitHub repo
   - Grant the GitHub deploy service account `roles/iam.serviceAccountTokenCreator`
   - Store the provider resource name and service account email as repository secrets (see below)

## 2. Secret Manager entries

Create the following Secret Manager secrets (one version named `latest` is sufficient):

| Secret name | Purpose |
| ----------- | ------- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (user-service & matching-service) |
| `SUPABASE_ANON_KEY` | Supabase anon key (frontend & collab-service) |
| `DATABASE_URL` | Prisma/Postgres connection string for question-service |
| `ADMIN_REGISTRATION_CODE` | Admin invite code for user-service |
| `GEMINI_API_KEY` | Google Gemini API key for collab-service |
| `JWT_SECRET` | Shared JWT signing secret for the API gateway |

Optionally add secrets for Redis if you prefer not to expose them as plain env vars:

| Optional secret | When to use |
| --------------- | ----------- |
| `MATCHING_REDIS_HOST` | Redis hostname for matching-service |
| `MATCHING_REDIS_PORT` | Redis port |

## 3. GitHub repository secrets & variables

Add the following **secrets** to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret | Value |
| ------ | ----- |
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_REGION` | Cloud Run region (e.g. `asia-southeast1`) |
| `GCP_SERVICE_ACCOUNT_EMAIL` | Deploy service account email (WIF principal) |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | WIF provider resource name |
| `MATCHING_REDIS_HOST` | (Optional) Redis host for matching-service |
| `MATCHING_REDIS_PORT` | (Optional) Redis port |

Add these **repository variables** (Settings → Secrets and variables → Actions → Variables):

| Variable | Description |
| -------- | ----------- |
| `ARTIFACT_REPOSITORY` | Artifact Registry repo name (e.g. `containers`) |
| `CLOUD_RUN_SERVICE_ACCOUNT` | Runtime service account email (leave blank to reuse deploy SA) |
| `CLOUD_RUN_VPC_CONNECTOR` | Full resource name of the Serverless VPC connector (optional) |
| `PASSWORD_RESET_REDIRECT` | User-service password reset redirect URL |
| `NEXT_PUBLIC_USE_MOCK` | `true`/`false` flag for the frontend mock mode (defaults to `false`) |
| `RESET_REDIS_ON_BOOT` | `true`/`false` to flush Redis during matching-service startup |
| `YW_HOST` | Hostname for the y-websocket server that collab-service proxies (defaults to `127.0.0.1`) |
| `YW_PORT` | Port for the y-websocket server (defaults to `1234`) |

## 4. Cloud Run deployment behaviour

The workflow builds all images with the production stage of their Dockerfiles (Node.js 22). Each service listens on `process.env.PORT`, so Cloud Run’s assigned port is honoured automatically. Deployment order matters: URLs for user-, question-, matching-, and collab-services are captured and fed into the API gateway and frontend so they always point at the latest revisions.

Environment variables and secrets are applied as follows:

- **user-service**: Supabase URL/service role key (Secret Manager), admin registration code (Secret Manager), optional password reset redirect (env var).
- **question-service**: Database URL (Secret Manager), user-service URL (env var).
- **matching-service**: Supabase URL/service role key (Secret Manager), question-service URL + Redis connection + reset flag (env vars).
- **collab-service**: Gemini API key (Secret Manager), y-websocket host/port (env vars).
- **api-gateway**: JWT secret (Secret Manager), downstream service URLs (env vars).
- **frontend**: Supabase URL/anon key (Secret Manager), API gateway URL + mock flag (env vars).

If you attach a Serverless VPC connector, the workflow passes `--vpc-egress=all-traffic` so outbound requests (Supabase, Redis, etc.) still reach the public internet through your connector.

## 5. Running the workflow

1. Push to `main` or `deployment`, or trigger **Actions → Deploy to Cloud Run → Run workflow** manually.
2. The workflow will:
   - Build & push container images to Artifact Registry
   - Deploy user-service → question-service → matching-service → collab-service → api-gateway → frontend
   - Print the public frontend URL in the final step
3. Inspect logs under Actions to confirm each `gcloud run deploy` succeeded. If any step fails, fix the configuration (common culprits: missing secrets or IAM grants) and re-run the workflow.

## 6. Verifying the deployment

- Run `gcloud run services list --project ${PROJECT_ID} --region ${REGION}` to confirm revisions.
- Check service logs with `gcloud run services logs tail SERVICE_NAME --project ${PROJECT_ID} --region ${REGION}` if a container fails to start (look for unhealthy Prisma connections, Redis connectivity, etc.).
- The API gateway URL (emitted during deployment) becomes the base URL for your frontend and for any external clients.

## 7. Local overrides

The `.env` files in each package now contain placeholder values geared towards Cloud Run. For local development (Docker Compose or `npm run dev`), copy `.env` to `.env.local` and restore your localhost URLs or credentials there without committing them to git.
