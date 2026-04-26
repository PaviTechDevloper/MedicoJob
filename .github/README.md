# Medicojob GitHub Actions Flow

This repository uses a matrix-based CI structure so every microservice follows the same pipeline without duplicating service-specific workflow files.

## Services Covered

- `backend/api-gateway`
- `backend/user-service`
- `backend/job-service`
- `backend/matching-service`
- `backend/availability-service`
- `backend/location-service`
- `backend/reputation-service`
- `frontend`

## Workflow Structure

- `workflows/ci.yaml`: installs dependencies for every service, runs `test` when available, and runs `build` when available.
- `workflows/ci-docker-build.yaml`: validates Docker builds for every service.
- `workflows/ci-image-pipeline.yaml`: builds and pushes every service image to GitHub Container Registry on `main`.
- `workflows/ci_sonar_scan.yml`: security gate workflow. It runs SonarCloud first, checks the Sonar quality gate, and only then runs Snyk. If Sonar fails, Snyk does not run and failure notifications are sent.
- `workflows/ci_snyk_scan.yml`: manual-only Snyk scan for one-off checks.
- `actions/notification-action/action.yaml`: reusable optional Slack and email notification action.

## Branch Flow

- Feature branches open pull requests into `develop`.
- `develop` validates CI, Docker builds, Sonar quality gate, and then Snyk.
- `main` receives production-ready merges and publishes container images to `ghcr.io`.

## Optional Repository Settings

Add these only if you want the related integrations:

- Secret `SLACK_WEBHOOK_URL` for notifications.
- Secret `SNYK_TOKEN` for Snyk scans. This is required by the security gate after Sonar passes.
- Secret `SONAR_TOKEN` and repository variable `SONAR_ORGANIZATION` for SonarCloud scans. These are required by the security gate.
- Secrets `NOTIFICATION_EMAIL_TO`, `NOTIFICATION_EMAIL_FROM`, `SMTP_SERVER`, `SMTP_USERNAME`, and `SMTP_PASSWORD` for email notifications. Optional secret `SMTP_PORT` defaults to `587`.
