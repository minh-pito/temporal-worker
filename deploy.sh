#!/bin/bash

PROJECT_ID="pito-platform-418503"
SERVICE_NAME="temporal-worker"
REGION="asia-southeast1"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$SERVICE_NAME"
ENV_VARS="PROJECT_ID=$ENV_PROJECT_ID,REGION=$ENV_REGION"

gcloud config set project $PROJECT_ID

echo "Building the container image..."
gcloud builds submit --timeout 10m --tag $IMAGE

# Deploy the container to Cloud Run
echo "Deploying the container to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --min-instances 1 \
  --concurrency 80 \
  --timeout 60 \
  --region $REGION \
  --set-env-vars $ENV_VARS \
  --allow-unauthenticated

# Print the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "Service deployed to: $SERVICE_URL"
