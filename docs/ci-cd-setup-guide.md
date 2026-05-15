# SyncingSteel HRIS: CI/CD Setup Guide

This guide explains how to set up a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline for the SyncingSteel HRIS application.

Because the production server is hosted on a private local network (on-premise) and not accessible from the public internet, we use a **GitHub Actions Self-Hosted Runner** to bridge the gap securely.

---

## Architecture Overview

1. **Continuous Integration (CI):**
   - **Where it runs:** GitHub's Cloud (Ubuntu latest)
   - **When it runs:** On every Push or Pull Request to the `main` branch.
   - **What it does:** Installs dependencies, compiles assets, and runs the `php artisan test` suite using an isolated, temporary SQLite database. It ensures that broken code is never deployed to the server.

2. **Continuous Deployment (CD):**
   - **Where it runs:** On the physical Ubuntu Server (`cameco-hris`).
   - **When it runs:** Only when code is pushed to `main` AND the CI tests pass successfully.
   - **What it does:** The Self-Hosted Runner listens for a signal from GitHub. When triggered, it automatically pulls the new code, updates dependencies, runs database migrations, and restarts the application seamlessly.

---

## Step 1: Register the Self-Hosted Runner

To allow GitHub to talk to your private Ubuntu server, you must install the Runner software on the server.

1. Go to your GitHub repository in your web browser.
2. Click **Settings** (the gear icon at the top right).
3. On the left sidebar, click **Actions** -> **Runners**.
4. Click the green **New self-hosted runner** button.
5. Select **Linux** and architecture **x64**.
6. GitHub will provide a list of commands. Open your Ubuntu server terminal and run the "Download" and "Configure" commands exactly as shown. 
   *(Note: Press Enter to accept the default values when it asks for the runner name and work folder).*

---

## Step 2: Install the Runner as a Background Service

Once configured, you must set the runner to operate in the background 24/7, even when you are logged out.

Run these commands in your Ubuntu terminal:
```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```
If the status says `active (running)`, your server is now officially connected to GitHub!

---

## Step 3: Create the GitHub Actions Workflows

In your local VS Code, create a new folder named `.github` in the root of your project, and inside it, create a `workflows` folder.

### Create the CI Workflow (`.github/workflows/ci.yml`)
Create this file to handle automated testing:

```yaml
name: Continuous Integration

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.3'

    - name: Install Composer Dependencies
      run: composer install -q --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist --ignore-platform-reqs

    - name: Copy Environment
      run: cp .env.example .env

    - name: Generate Application Key
      run: php artisan key:generate

    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Install NPM Dependencies & Build
      run: |
        npm ci
        npm run build

    - name: Run Tests
      run: php artisan test
```

### Create the CD Workflow (`.github/workflows/cd.yml`)
Create this file to handle the automated deployment to your server:

```yaml
name: Continuous Deployment

on:
  workflow_run:
    workflows: ["Continuous Integration"]
    types:
      - completed

jobs:
  deploy:
    runs-on: self-hosted
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Run Deployment Script
      run: |
        cd /opt/cameco
        php artisan down --refresh=15 --secret="cameco-deployment"
        git pull origin main
        composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev --ignore-platform-reqs
        npm install
        npm run build
        php artisan migrate --force
        php artisan optimize:clear
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        sudo systemctl restart cameco-queue
        php artisan up
```

---

## Step 4: Commit and Push!

Once you have created those two files, commit them in VS Code and push to GitHub. 

1. GitHub will automatically detect `.github/workflows/ci.yml` and run your tests in the cloud.
2. If the tests pass, GitHub will trigger `.github/workflows/cd.yml`.
3. Your Ubuntu server will instantly download the code and deploy it without you lifting a finger!
