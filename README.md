# CXOneGo-Backend

### A backend service built with Node.js, TypeORM, and MySQL

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

## Introduction

This is a Node.js backend project using TypeORM for data management with a MySQL database for CXOneGo application.

## Features

- TypeORM for ORM functionality
- MySQL database integration
- RESTful API endpoints
- Environment-based configuration
- Error handling and logging
- Secure authentication (e.g., JWT or OAuth)

## Prerequisites

Before running this project, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [MySQL](https://www.mysql.com/)
- [TypeScript](https://www.typescriptlang.org/) (if not globally installed)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/scrobits-github/cxonego-backend.git
   ```

2. Navigate into the project directory:
   ```
   cd cxonego-backend
   ```
3. Install dependencies:
   ```
   yarn
   ```

## Environment Variables

Create a .env file in the root directory and configure the following variables:

```
AWS_ACCESS_KEY=
AWS_REGION=
AWS_SECRET_KEY=
AWS_SES_SENDER=
COOKIES_DOMAIN=

DATABASE_HOST=
DATABASE_NAME=
DATABASE_PASSWORD=
DATABASE_PORT=3306
DATABASE_USER_NAME=

JWT_SECRET=jkfjsjkdhjdhjhjh
NODE_ENV=development
PORT=8000
SUBDOMAIN_OFFSET=

# Firebase Credential
PROJECT_ID=
PRIVATE_KEY_ID=
PRIVATE_KEY=
CLIENT_EMAIL=
CLIENT_ID=
AUTH_URI=
TOKEN_URI=
AUTH_PROVIDER_x509_CERT_URL=
CLIENT_x509_CERT_URL=
UNIVERSE_DOMAIN=
FIREBASE_SERVER_KEY=

RAZORPAY_API_KEY=
RAZORPAY_API_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CAPTCHA_SECRET_KEY=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_NAME=
```

## Database Setup

When you setup the env file, on running the node server, you'll be connected to the Database, for creating a local connection of this, use the same credentials.

## Running the Project

To run the project in development mode:

- Use Development DB credentials in .env

To run the project in stage mode:

- Use Stage DB credentials in .env

To run the project in Production mode:

- Use Production DB credentials in .env

### Commands:

To run the server

```
yarn dev
```

To build the code

```
yarn build
```

## API Endpoints

```
BASE_URL = http:localhost:8000/api/v1
```

### Table's Endpoints

- Auth APIs: `/auth`
- Lead APIs: `/lead`
- Contact APIs: `/contact`
- Account APIs: `/account`
- Auth APIs: `/users/auth`
- Email APIs: `/email-poc`
- Role APIs: `/users/role`
- Users APIs: `/users`
- Services APIs: `/services`
- Opportunity APIs: `/opportunity`
- MoodImage APIs: `/moodimage`
- Activity APIs: `/activity`
- Dashboard APIs: `/dashboard`
- Audit APIs: `/audit`
- Calendar APIs: `/calender`
- Organization APIs: `/organization`
- Referral APIs: `/refer`
- Note APIs: `/note`
- Health APIs: `/health`
- Plan APIs: `/plan`
- Subscription APIs: `/subscription`
- Custom Plan Request APIs: `/customPlanRequest`
- Super Admin APIs: `/superAdmin`
- Cron APIs: `/cron`

## Project Structure

```
src/
│
├── common/         # Common configurations
├── controllers/    # Request handlers
├── entity/         # Database entities/models
├── middlewares/    # Express middlewares
├── interfaces/     # Type files
├── routes.ts       # Route definitions
├── schemas         # Schema files for each entity
├── services/       # Business logic
├── index.ts        # Entry point of the application
└── data-source.ts  # Database connection config
```

## Technologies Used

- <b>Node.js</b>: JavaScript runtime for building scalable server-side applications
- <b>TypeScript</b>: Typed superset of JavaScript
- <b>TypeORM</b>: ORM for TypeScript and JavaScript (ES7, ES6, ES5)
- <b>MySQL</b>: Relational database management system
  Express.js: Web framework for Node.js
