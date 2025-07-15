# Quick Start Guide

## Introduction

This User Guide provides an overview of the initial steps required to get the application running and additional steps for continued development.

## Pre-requisites

- Register the website domain at a domain name registrar such as [https://www.namecheap.com/](https://www.namecheap.com/), which is where `https://batchprot.com` was purchased.
- Sign up for an AWS account at [https://aws.amazon.com/console/](https://aws.amazon.com/console/).
- Follow this guide from SST on setting up the AWS account: [https://sst.dev/docs/aws-accounts](https://sst.dev/docs/aws-accounts).
- Install Docker Desktop to run the local postgres database and FastAPI container: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).

## Getting Started

1. **Clone the project and install dependencies**
    - Clone the repository:

      ```bash
      git clone <your-repo-url>
      ```

    - Install dependencies:

      ```bash
      pnpm i
      ```

    - Install Python dependencies:

      ```bash
      uv sync
      ```

2. **Set up Local Development Environment**
    - Login to AWS SSO:

      ```bash
      pnpm sso
      ```

    - In a new terminal, spin up the development infrastructure:

      ```bash
      pnpm dev
      ```

    - In another terminal, start the local PostgreSQL database in a Docker container:

      ```bash
      pnpm start:db
      ```

    - Run database migrations to set up the schema:

      ```bash
      pnpm db:migrate
      ```

## Deployment to Production

1. **Configure Domain**
    - Follow this guide to use your custom domain in production: [https://sst.dev/docs/custom-domains](https://sst.dev/docs/custom-domains).
2. **Deploy Application**
    - Deploy the SST application to production:

      ```bash
      pnpm sst:deploy
      ```

3. **Database Migration**
    - To connect to the production database locally, run the following command to open a tunnel:

      ```bash
      sst tunnel --stage production
      ```

    - With the tunnel active, run migrations to set up the production RDS schema:

      ```bash
      pnpm db:migrate:prod
      ```

Done! The app should be successfully deployed.
