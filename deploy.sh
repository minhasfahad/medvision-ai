#!/bin/bash
cd ~/medvision-ai
git pull origin dev
npm install --legacy-peer-deps
npm run build
pm2 restart medvision
echo "Deployment Complete!"
# Trigger CI/CD Automation
