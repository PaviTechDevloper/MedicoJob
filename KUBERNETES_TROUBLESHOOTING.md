# MedicoJob Kubernetes Troubleshooting Guide

This document serves as a record of the issues encountered and resolved while deploying the MedicoJob microservices architecture to Kubernetes. Use this as a reference if similar issues occur in the future.

---

## 1. Frontend "Site Can't Be Reached"
**Symptoms:** Accessing the frontend via the NodePort resulted in connection refused or timeout errors.
**Root Cause:** 
- The React Development server running inside the Docker container was binding to `localhost` (127.0.0.1) instead of `0.0.0.0`, making it inaccessible from outside the container.
- The React dev server was defaulting to port `5000`, while the Kubernetes service expected port `3000`.
**Solution:** 
In `k8s/frontend/deployment.yaml`, we injected the following environment variables to force React to bind correctly:
```yaml
- name: HOST
  value: "0.0.0.0"
- name: PORT
  value: "3000"
```

## 2. API Connection Refused / Timed Out
**Symptoms:** The frontend loaded, but all API calls to `/auth/login` and WebSockets failed with `net::ERR_TIMED_OUT`.
**Root Cause:** The React app was hardcoded to send requests to port `5000`. However, in a Kubernetes environment using `NodePort`, the `api-gateway` is assigned a dynamic 5-digit port (e.g., `32290`). The browser on a personal laptop cannot route to an internal Kubernetes cluster IP.
**Solution:** 
Updated the frontend deployment to explicitly point to the AWS EC2 Public IP and the assigned `api-gateway` NodePort:
```yaml
- name: REACT_APP_API_URL
  value: "http://43.205.203.210:32290"
```

## 3. 500 Internal Server Error on Login
**Symptoms:** Clicking "Log In" instantly returned a `500 Internal Server Error`.
**Root Cause:** The `user-service` crashed during JWT token generation because `process.env.JWT_SECRET` was `undefined`. It was defined in the local `.env` file but was never added to the Kubernetes cluster configuration.
**Solution:** 
Added the `JWT_SECRET` key to `k8s/configmap.yaml` so all backend services could access it:
```yaml
data:
  JWT_SECRET: "super_secret_jwt_key_medicojob_2026"
```

## 4. Kubernetes Not Applying Docker Updates
**Symptoms:** After pushing a new Docker image for the frontend, the website spun forever and failed to load, even after restarting the pod.
**Root Cause:** The new Docker image was pushed to Docker Hub with the same tag (`v1`) as the old image. Because the deployment was set to `imagePullPolicy: IfNotPresent`, the Kubernetes worker node saw it already had a `v1` image cached locally and refused to download the new one.
**Solution:** 
Changed the pull policy in `k8s/frontend/deployment.yaml`:
```yaml
imagePullPolicy: Always
```

## 5. "Invalid Credentials" (400 Bad Request) on Demo Accounts
**Symptoms:** Attempting to log in using the "Applicant Demo" button resulted in `400 Bad Request`.
**Root Cause:** The Kubernetes cluster uses its own internal MongoDB database (`mongodb://mongodb:27017`). This database was completely empty and did not contain the demo users that were previously seeded in the local MongoDB Atlas database.
**Solution:** 
Manually registered a new account using the frontend UI (`/register`) so the user was saved directly into the internal Kubernetes database.

## 6. "Token is not valid" (401 Unauthorized) when Posting a Job
**Symptoms:** After successfully logging in, attempting to create a job posting returned a `401 Unauthorized` error.
**Root Cause:** After adding the `JWT_SECRET` to the ConfigMap to fix the login issue, only the `user-service` was restarted. The `job-service` was still running with the old configuration and did not have the `JWT_SECRET` loaded into its memory, causing `jwt.verify()` to fail.
**Solution:** 
Restarted all backend services to ensure they all loaded the latest ConfigMap variables:
```bash
kubectl rollout restart deployment job-service matching-service availability-service location-service reputation-service -n pavi-ns
```

## 7. Hardcoded IPs in Deployment Files (Best Practices)
**Symptoms:** Putting `REACT_APP_API_URL` with a hardcoded public IP directly inside `frontend/deployment.yaml` is considered bad practice because IPs change and it clutters the deployment file.
**Solution/Options:** We removed the hardcoded IPs from the deployment file. To fix the resulting API connection errors, you must use one of two approaches:
- **Option A (ConfigMap):** Add `REACT_APP_API_URL` to the central `k8s/configmap.yaml` instead. The deployment will automatically inject it via `envFrom: configMapRef`. This keeps the deployment YAML perfectly clean.
- **Option B (NGINX Proxy):** Implement a multi-stage Docker build that serves the React app via NGINX, and configure NGINX to proxy `/api` requests to the internal Kubernetes DNS (`api-gateway:5000`). This completely eliminates the need for hardcoded public IPs, but requires rebuilding the Docker image.
