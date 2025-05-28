#!/bin/bash
# Deploy script for Vite app

set -e

# Build app
npm run build

# Generate sitemap
npm run generate-sitemap || node scripts/generate-sitemap.ts

# Deploy examples (uncomment and edit as needed)
# rsync -avz --delete dist/ user@yourserver.com:/var/www/html/
# aws s3 sync dist/ s3://your-bucket-name/ --delete

# Deploy to a remote server using rsync
rsync -avz --delete dist/ user@yourserver.com:/var/www/html/

# Uncomment and configure the following line for AWS S3 deployment
# aws s3 sync dist/ s3://your-bucket-name/ --delete

echo "Deployment complete. Update service worker version to refresh cache if needed."
