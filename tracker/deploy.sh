#!/bin/bash
set -e

# Decoupled Edge deployment script for AuraWorks tracker assets
# Syncs compiled/minified assets to Cloudflare R2 / AWS S3 storage buckets.

# Required environment variables check
if [ -z "$BUCKET_NAME" ]; then
  echo "⚠️  Warning: BUCKET_NAME is not set. Defaulting to 'auraworks-cdn'."
  BUCKET_NAME="auraworks-cdn"
fi

# 1. Build assets locally
echo "📦 Running build pipeline..."
npm run build

# 2. Upload to the storage bucket with Cache-Control headers
echo "🚀 Deploying tracker assets to bucket: s3://${BUCKET_NAME}..."

# Sync aura.js to CDN bucket with cache-control max-age of 24 hours (86400 seconds)
aws s3 cp dist/aura.min.js s3://${BUCKET_NAME}/aura.js \
  --cache-control "public, max-age=86400" \
  --content-type "application/javascript"

# Sync banner.js to banner bucket (or CDN) with cache-control max-age of 24 hours
aws s3 cp dist/banner.min.js s3://${BUCKET_NAME}/banner.js \
  --cache-control "public, max-age=86400" \
  --content-type "application/javascript"

echo "✨ Edge assets deployment completed successfully!"
