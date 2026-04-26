# MedicoJob Argo CD Flow

This folder uses an app-of-apps layout.

## Bootstrap

Install Argo CD in the cluster first, then apply one environment root:

```bash
kubectl apply -f helm/env/dev/root/infra-root.yaml
kubectl apply -f helm/env/dev/root/apps-root.yaml
```

For production:

```bash
kubectl apply -f helm/env/prod/root/infra-root.yaml
kubectl apply -f helm/env/prod/root/apps-root.yaml
```

## Sync Order

1. `infra-root` creates infrastructure Applications.
2. `app-namespace` creates the `dev` or `prod` namespace, `medicojob-config`, and `medicojob-secrets`.
3. `gateway` creates the Gateway API `Gateway`.
4. `apps-root` creates one Argo CD Application per microservice.
5. Each app chart deploys its Deployment, Service, HTTPRoute, ServiceAccount, and optional Job.

## GHCR Images

The app charts use the Docker pipeline image naming format:

```text
ghcr.io/pavitechdevloper/pavitechdevloper.<service_name>:latest
```

Examples:

```text
ghcr.io/pavitechdevloper/pavitechdevloper.frontend:latest
ghcr.io/pavitechdevloper/pavitechdevloper.api_gateway:latest
ghcr.io/pavitechdevloper/pavitechdevloper.user_service:latest
```

If GHCR packages are private, create a Kubernetes pull secret and set `imagePullSecrets` in each service values file.

## Secrets

Secrets are not hardcoded in Git. The `app-namespace` chart creates `medicojob-config` from normal values, but `medicojob-secrets` is disabled by default:

```yaml
secret:
  create: false
  name: medicojob-secrets
  data: {}
```

Create the secret outside Git, or pass secret values through a private Argo CD values source, Sealed Secrets, External Secrets, or Argo CD parameters. The shape is documented in:

```text
helm/infra/app-namespace/values-secret-example.yaml
```
