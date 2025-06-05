# iCal Importer Helm Integration

The CalenDO Helm chart now includes the iCal Importer as a CronJob that automatically synchronizes calendars on a scheduled basis.

## Overview

The iCal Importer is deployed as a Kubernetes CronJob that:
- Runs every 30 minutes by default (configurable)
- Synchronizes calendars defined in the `sync-config.yaml`
- Uses the same database as the CalenDO backend
- Maintains calendar data up-to-date automatically

## Configuration

### Basic Configuration

The iCal Importer is configured in `values.yaml` under the `icalImporter` section:

```yaml
icalImporter:
  enabled: true
  
  cronjob:
    schedule: "*/30 * * * *"  # Run every 30 minutes
    successfulJobsHistoryLimit: 3
    failedJobsHistoryLimit: 1
    activeDeadlineSeconds: 600  # 10 minutes timeout
    concurrencyPolicy: Forbid
```

### Schedule Configuration

The cron schedule uses standard cron format:
- `"*/30 * * * *"` - Every 30 minutes
- `"0 */2 * * *"` - Every 2 hours
- `"0 9,17 * * 1-5"` - Twice daily (9 AM and 5 PM) on weekdays
- `"0 1 * * *"` - Daily at 1 AM

### Calendar Sources

Configure your calendar sources in the `sync-config.yaml` section:

```yaml
icalImporter:
  configMapData:
    sync-config.yaml: |
      calendars:
        - name: "University Schedule"
          url: "https://your-university.edu/calendar.ics"
          enabled: true
        - name: "Team Calendar"
          url: "https://calendar.google.com/calendar/ical/team@company.com/public/basic.ics"
          enabled: true
          custom_id: "team-cal-2024"
        - name: "Personal Calendar"
          url: "https://outlook.office365.com/owa/calendar/personal@example.com/calendar.ics"
          enabled: false  # Temporarily disabled
```

### Resource Limits

Adjust resource limits based on your cluster capacity:

```yaml
icalImporter:
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 50m
      memory: 128Mi
```

## Deployment

### Deploy with Helm

```bash
# Deploy or upgrade the chart
helm upgrade --install calendo ./helm

# Check the CronJob status
kubectl get cronjobs

# View recent jobs
kubectl get jobs

# Check logs from the latest job
kubectl logs -l app.kubernetes.io/component=ical-importer --tail=100
```

## Monitoring

### Check CronJob Status

```bash
# List all cron jobs
kubectl get cronjobs

# Describe the cron job for details
kubectl describe cronjob calendo-ical-importer

# View job history
kubectl get jobs --selector=app.kubernetes.io/component=ical-importer

# Check recent pod logs
kubectl logs -l app.kubernetes.io/component=ical-importer --since=1h
```

### Common Issues

1. **Image Pull Errors**: Ensure the `calendo-ical-importer` image is built and available
2. **Database Connection**: Verify the PostgreSQL service is running and accessible
3. **Configuration Errors**: Check ConfigMap content with `kubectl get configmap calendo-ical-importer -o yaml`
4. **Network Issues**: Ensure the cluster can reach external iCal URLs

### Troubleshooting Commands

```bash
# Check if PostgreSQL is accessible
kubectl exec -it deployment/calendo-backend -- nc -zv calendo-postgresql 5432

# Verify ConfigMap
kubectl get configmap calendo-ical-importer -o yaml

# Check latest job logs
kubectl logs $(kubectl get pods -l app.kubernetes.io/component=ical-importer --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')

# Force run the CronJob manually
kubectl create job --from=cronjob/calendo-ical-importer manual-sync-$(date +%s)
```

## Security Considerations

- The importer runs with minimal privileges
- No external network access is required except for fetching iCal URLs
- Database credentials are stored in ConfigMaps (consider using Secrets for production)
- The container runs as a non-root user

## Customization

### Custom Docker Image

If you need to customize the importer:

1. Build your custom image:
```bash
cd ical-importer
docker build -t your-registry/calendo-ical-importer:custom .
```

2. Update values.yaml:
```yaml
icalImporter:
  image:
    repository: your-registry/calendo-ical-importer
    tag: custom
```

### Environment-Specific Configuration

Use different values files for different environments:

```bash
# Development
helm upgrade --install calendo ./helm -f values-dev.yaml

# Production
helm upgrade --install calendo ./helm -f values-prod.yaml
```

## Integration with CI/CD

Include the ical-importer image build in your CI/CD pipeline:

```yaml
# Example GitLab CI
build-ical-importer:
  stage: build
  script:
    - cd ical-importer
    - docker build -t $CI_REGISTRY_IMAGE/ical-importer:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE/ical-importer:$CI_COMMIT_SHA
```

Update the Helm values to use the new image tag during deployment.
