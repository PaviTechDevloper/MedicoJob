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

- `workflows/ci.yaml`: main entry workflow. It gets the pull request author email, calls Sonar, calls Snyk only when Sonar passes, and sends one email notification from one notify job.
- `workflows/ci-docker-build.yaml`: validates Docker builds for every service.
- `workflows/ci-image-pipeline.yaml`: builds and pushes every service image to GitHub Container Registry on `main`.
- `workflows/ci_sonar_scan.yml`: reusable SonarQube/SonarCloud workflow called by `ci.yaml`. It returns `quality_gate_status`, `notify_tool`, `notify_title`, and `notify_summary`.
- `workflows/ci_snyk_scan.yml`: reusable Snyk workflow called by `ci.yaml` only after Sonar passes. It returns `snyk_status` and `notify_summary`.
- `actions/notification-action/action.yaml`: reusable email notification action.

## Branch Flow

- Feature branches open pull requests into `develop`.
- `develop` validates CI in this sequence: Sonar quality gate, then Snyk.
- `main` receives production-ready merges and publishes container images to `ghcr.io`.

## Optional Repository Settings

Add these only if you want the related integrations:

- Secret `MAIL_FROM` for the notification sender email.
- Secret `MAIL_TO` for the notification recipient email. If this is empty, the pipeline falls back to the pull request author's commit email.
- Secret `SNYK_TOKEN` for Snyk scans. This is required by the security gate after Sonar passes.
- Secrets `SONAR_TOKEN`, `SONAR_HOST_URL`, and `SONAR_PROJECT_KEY` for SonarQube/SonarCloud scans. These are required by the security gate.
- Secrets `SMTP_SERVER`, `SMTP_USERNAME`, and `SMTP_PASSWORD` for email notifications. Optional secret `SMTP_PORT` defaults to `587`.
- Optional secrets `SNYK_ORG` and `SNYK_PROJECT_ID` are used for Snyk notification report links.

## Failure Notification Routing

- The notify job sends a single email when Sonar fails or Snyk fails.
- Sonar emails include the normalized quality gate summary and a Sonar report link.
- Snyk emails include vulnerable package summaries and the checked dependency manifest.
