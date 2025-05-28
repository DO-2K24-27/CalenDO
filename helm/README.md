# Deploying CalenDO on Kubernetes

This document provides step-by-step instructions for deploying the CalenDO application on Kubernetes using Helm. The chart supports deploying both backend (API) and frontend components.

## Prerequisites

Before you begin, ensure you have the following:

1. A Kubernetes cluster up and running
2. Helm 3 installed on your local machine
3. `kubectl` configured to communicate with your cluster
4. Docker images for the CalenDO components (already built and available in a registry or locally)

## Configuration

The Helm chart for CalenDO is located in the `helm/calendoapi` directory and comes with the following configuration options that can be customized:

- Backend and frontend component settings
- Database connection settings
- Image repositories and tags
- Replicas and scaling
- Resource limits
- Ingress configurations
- And more...

## Deployment Steps

### 1. Update the values.yaml file

Before deploying, update the `values.yaml` file in the `helm/calendoapi` directory with your own configuration:

```yaml
backend:
  image:
    repository: <your-registry>/calendoapi  # Update this with your Docker image repository
    tag: <version>                          # Set the tag of your backend image

# When frontend is ready
frontend:
  enabled: false
  # image:
  #   repository: <your-registry>/calendoui
  #   tag: <version>
```

### 2. Add the Bitnami repository (for PostgreSQL dependency)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### 3. Update chart dependencies

```bash
cd helm/calendoapi
helm dependency update
```

### 4. Deploy the chart

```bash
# For a new deployment with just the backend (dev environment)
helm install calendoapi ./helm/calendoapi --namespace <your-namespace> --create-namespace

# For production deployment
helm install calendoapi ./helm/calendoapi --namespace <your-namespace> -f ./helm/calendoapi/values-production.yaml --create-namespace

# To enable the frontend when it becomes available
helm upgrade calendoapi ./helm/calendoapi --namespace <your-namespace> --set frontend.enabled=true

# To upgrade an existing deployment
helm upgrade calendoapi ./helm/calendoapi --namespace <your-namespace>
```

### 5. Check the deployment status

```bash
kubectl get pods -n <your-namespace>
```

## Accessing the API

After the deployment is complete, you can access the API service:

1. If using ClusterIP (default):
   ```bash
   kubectl port-forward service/calendoapi -n <your-namespace> 8080:8080
   ```
   The API will be available at `http://localhost:8080`

2. If using a LoadBalancer or Ingress, follow the instructions from:
   ```bash
   helm status calendoapi -n <your-namespace>
   ```

## Configuration Options

You can override any default values using the `--set` parameter in the helm command or by creating a custom values file:

```bash
# Configure backend replicas
helm install calendoapi ./helm/calendoapi -n <your-namespace> --set backend.replicaCount=3

# Or with a custom values file:
helm install calendoapi ./helm/calendoapi -n <your-namespace> -f my-values.yaml
```

### Advanced Configuration Options

The chart includes several advanced Kubernetes features that can be enabled:

1. **Network Policies** - Secure your application's network traffic:
   ```bash
   helm install calendoapi ./helm/calendoapi -n <your-namespace> \
     --set networkPolicy.enabled=true \
     --set networkPolicy.allowExternal=false
   ```

2. **Resource Quotas** - Limit resource usage in the namespace:
   ```bash
   helm install calendoapi ./helm/calendoapi -n <your-namespace> \
     --set resourceQuota.enabled=true
   ```

3. **Pod Disruption Budget** - Ensure availability during maintenance:
   ```bash
   helm install calendoapi ./helm/calendoapi -n <your-namespace> \
     --set backend.replicaCount=3  # PDB requires replicaCount > 1
   ```

4. **Horizontal Pod Autoscaler** - Automatically scale based on CPU/memory usage:
   ```bash
   helm install calendoapi ./helm/calendoapi -n <your-namespace> \
     --set backend.autoscaling.enabled=true \
     --set backend.autoscaling.minReplicas=2 \
     --set backend.autoscaling.maxReplicas=10
   ```

## Enabling the Frontend

When the frontend component is ready, you can enable it by setting `frontend.enabled=true`:

```bash
helm upgrade calendoapi ./helm/calendoapi -n <your-namespace> \
  --set frontend.enabled=true \
  --set frontend.image.repository=your-registry/calendoui \
  --set frontend.image.tag=v1.0.0
```

## Customizing PostgreSQL

By default, the chart deploys a PostgreSQL database with the following credentials:
- Username: postgres
- Password: postgres
- Database: calendo

You can customize these by setting the appropriate values:

```bash
helm install calendoapi ./helm/calendoapi -n <your-namespace> \
  --set postgresql.auth.username=myuser \
  --set postgresql.auth.password=mypassword \
  --set postgresql.auth.database=mydb
```

## Uninstalling the Chart

```bash
helm uninstall calendoapi -n <your-namespace>
```

Note that this won't delete any persistent volumes created by the chart.

## Troubleshooting

If you encounter issues with the deployment:

1. Check the pod status:
   ```bash
   kubectl get pods -n <your-namespace>
   ```

2. Check the pod logs:
   ```bash 
   kubectl logs <pod-name> -n <your-namespace>
   ```

3. Check the health endpoints:
   ```bash
   kubectl port-forward <pod-name> -n <your-namespace> 8080:8080
   curl http://localhost:8080/api/health
   ```
