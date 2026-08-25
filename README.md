# Doctorly Server

> Secure REST API backend for the Doctorly healthcare management platform, providing authenticated user, doctor, and patient management backed by MongoDB and Firebase Authentication.

## Elevator Pitch

**Doctorly Server** is the backend API that powers the Doctorly healthcare management platform. Built with **Node.js and Express.js**, it provides RESTful endpoints for managing users, doctors, and patients while using **Firebase Admin SDK** to verify Firebase ID tokens and protect authenticated resources. MongoDB provides persistent data storage through Mongoose models, while a modular route-controller-model architecture keeps authentication, business logic, and database operations separated and maintainable. The API is designed to work with the Doctorly Next.js frontend and provides a secure foundation for healthcare administration features.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Request and Data Flow](#request-and-data-flow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firebase Admin Configuration](#firebase-admin-configuration)
- [Authentication](#authentication)
- [API Routes](#api-routes)
- [Data Models](#data-models)
- [Example Requests](#example-requests)
- [Technical Decisions](#technical-decisions)
- [Visual Evidence](#visual-evidence)
- [Development Scripts](#development-scripts)
- [Common Issues](#common-issues)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)

---

# Features

## Authentication & Authorization

- Firebase Authentication integration
- Firebase ID token verification
- Bearer token authentication
- Protected API routes
- Authentication middleware
- User identity available to protected controllers

## User Management

- Create users
- Retrieve all users
- Retrieve individual users
- Update users
- Delete users
- Admin role support

## Doctor Management

- Create doctor records
- Retrieve doctors
- Retrieve individual doctor details
- Update doctor information
- Delete doctors
- Doctor specialization filtering
- Patient assignment support

## Patient Management

- Create patients
- Retrieve patients
- Retrieve individual patients
- Bulk patient creation
- Update patient information
- Delete patients
- Doctor assignment
- Patient filtering support

## Database

- MongoDB persistence
- Mongoose schemas and models
- Automatic timestamps
- Model-level validation
- MongoDB Atlas support

## API Infrastructure

- Express.js REST API
- CORS configuration
- JSON request parsing
- Environment-based configuration
- Modular route/controller architecture
- Development support with Nodemon

---

# Technology Stack

| Category                  | Technology              |
| ------------------------- | ----------------------- |
| Runtime                   | Node.js                 |
| Framework                 | Express.js              |
| Database                  | MongoDB                 |
| ODM                       | Mongoose                |
| Authentication            | Firebase Admin SDK      |
| Authentication Provider   | Firebase Authentication |
| Password Utility          | bcrypt                  |
| Environment Configuration | dotenv                  |
| Cross-Origin Requests     | CORS                    |
| Development               | Nodemon                 |
| Formatting                | Prettier                |

---

# System Architecture

Doctorly Server follows a layered REST API architecture.

The Next.js frontend communicates with the Express backend through HTTP requests. For protected requests, the frontend sends a Firebase ID token in the `Authorization` header. The Express authentication middleware verifies that token using Firebase Admin SDK before allowing the request to continue.

After authentication succeeds, the request is passed to the appropriate route and controller. Controllers perform application-level operations using Mongoose models, which communicate with MongoDB.

```text
                         ┌──────────────────────┐
                         │   Doctorly Frontend  │
                         │      Next.js         │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP Request
                                    │
                                    │ Authorization:
                                    │ Bearer <ID Token>
                                    ▼
                         ┌──────────────────────┐
                         │    Express Server    │
                         │       index.js       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Auth Middleware    │
                         │                      │
                         │ Firebase Admin SDK   │
                         └──────────┬───────────┘
                                    │
                         Token verified?
                              /          \
                            No            Yes
                            │              │
                            ▼              ▼
                         401 Error     Express Router
                                           │
                              ┌────────────┼────────────┐
                              │            │            │
                              ▼            ▼            ▼
                           Users       Doctors       Patients
                           Router       Router        Router
                              │            │            │
                              ▼            ▼            ▼
                           User       Doctor        Patient
                        Controller   Controller    Controller
                              │            │            │
                              └────────────┼────────────┘
                                           ▼
                                   Mongoose Models
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   MongoDB   │
                                    └─────────────┘
```

---

# Request and Data Flow

A protected Doctorly API request follows the following lifecycle.

## 1. User authenticates

The user signs into the Doctorly frontend using Firebase Authentication.

```text
User
 ↓
Firebase Authentication
 ↓
Authenticated Firebase User
 ↓
Firebase ID Token
```

---

## 2. Frontend sends API request

The frontend sends the Firebase ID token with the request:

```http
Authorization: Bearer <firebase-id-token>
```

Example:

```http
GET /api/doctors
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

---

## 3. Express receives the request

The request enters the Express application through `index.js`.

The server is responsible for:

- Loading environment variables
- Connecting to MongoDB
- Configuring CORS
- Parsing JSON
- Registering routes
- Applying authentication middleware

---

## 4. Authentication middleware verifies the token

Protected routes pass through:

```text
src/middleware/auth.middleware.js
```

The middleware extracts the Bearer token and sends it to Firebase Admin SDK for verification.

```text
Authorization Header
        ↓
Extract Bearer Token
        ↓
Firebase Admin
        ↓
verifyIdToken()
        ↓
Valid?
```

If the token is invalid or missing:

```http
401 Unauthorized
```

If valid, the request continues.

---

## 5. Router selects the endpoint

For example:

```http
GET /api/doctors
```

is handled by:

```text
src/routers/doctor.route.js
```

---

## 6. Controller performs business logic

The route calls the appropriate controller:

```text
src/controllers/doctor.controller.js
```

The controller is responsible for processing the request and interacting with the database layer.

---

## 7. Mongoose communicates with MongoDB

The controller uses the Doctor model:

```text
src/models/doctor.model.js
```

Mongoose converts the application operation into MongoDB queries.

```text
Controller
    ↓
Doctor Model
    ↓
Mongoose
    ↓
MongoDB
```

---

## 8. API response

The server returns a JSON response:

```text
MongoDB
   ↓
Mongoose
   ↓
Controller
   ↓
Express
   ↓
HTTP Response
   ↓
Next.js Frontend
```

---

# Project Structure

```text
doctorly-server/
│
├── index.js
├── package.json
├── .env
├── .env.example
├── .gitignore
├── README.md
│
└── src/
    │
    ├── config/
    │   ├── db.js
    │   └── firebase-admin.js
    │
    ├── controllers/
    │   ├── doctor.controller.js
    │   ├── patient.controller.js
    │   └── user.controller.js
    │
    ├── middleware/
    │   └── auth.middleware.js
    │
    ├── models/
    │   ├── doctor.model.js
    │   ├── patient.model.js
    │   └── user.model.js
    │
    └── routers/
        ├── doctor.route.js
        ├── home.route.js
        ├── patient.route.js
        └── user.route.js
```

### Directory Responsibilities

| Directory      | Responsibility                        |
| -------------- | ------------------------------------- |
| `config/`      | Database and Firebase configuration   |
| `controllers/` | Request handling and business logic   |
| `middleware/`  | Authentication and request processing |
| `models/`      | MongoDB/Mongoose schemas              |
| `routers/`     | API endpoint definitions              |
| `index.js`     | Application entry point               |

---

# Getting Started

## Prerequisites

Before running Doctorly Server locally, make sure you have:

- Node.js installed
- npm installed
- MongoDB locally or MongoDB Atlas
- A Firebase project
- Firebase Admin credentials
- Doctorly frontend configured to use the backend API

Verify Node.js:

```bash
node -v
```

Verify npm:

```bash
npm -v
```

---

# Installation

## 1. Clone the repository

```bash
git clone <https://github.com/kaziArmanNihad/doctorly-server.git>
```

Navigate into the project:

```bash
cd doctorly-server
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create environment configuration

Create:

```text
.env
```

using the provided example:

```text
.env.example
```

Example:

```env
PORT=5001

MONGODB_URI=mongodb://127.0.0.1:27017/doctorly
```

---

## 4. Configure Firebase Admin

Configure Firebase Admin credentials according to the configuration implemented in:

```text
src/config/firebase-admin.js
```

For local development, you may use a Firebase service-account JSON file.

**Do not commit the service-account file to Git.**

Add it to `.gitignore`:

```gitignore
serviceAccountKey.json
.env
.env.*
!.env.example
```

For production deployments, environment-based Firebase credentials are recommended instead of storing a service-account JSON file in the repository.

---

## 5. Start MongoDB

If using a local MongoDB installation, make sure the MongoDB service is running.

Example local connection:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/doctorly
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
```

---

## 6. Start the server

Development:

```bash
npm run dev
```

The server will normally run on:

```text
http://localhost:5001
```

---

# Environment Variables

Create a `.env.example` file in the root of the repository.

```env
# Server
PORT=5001

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/doctorly

# Firebase Admin
# Use the variables required by src/config/firebase-admin.js
# Do not commit private Firebase credentials.
```

If your current Firebase Admin implementation uses a service-account JSON file rather than environment variables, keep the JSON file outside Git and document the exact credential mechanism used by `firebase-admin.js`.

---

# `.env.example`

The repository should contain:

```text
.env.example
```

A safe example:

```env
# Express
PORT=5001

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/doctorly

# Firebase Admin
# Configure these only if firebase-admin.js reads credentials from environment variables.
# FIREBASE_PROJECT_ID=
# FIREBASE_CLIENT_EMAIL=
# FIREBASE_PRIVATE_KEY=
```

> Never put real Firebase private keys, passwords, MongoDB credentials, or service-account values into `.env.example`.

---

# Firebase Admin Configuration

Firebase Admin is used by the backend to verify Firebase Authentication ID tokens.

Configuration is located at:

```text
src/config/firebase-admin.js
```

The backend uses Firebase Admin rather than trusting authentication information sent by the frontend.

The basic security model is:

```text
Frontend
   │
   │ Firebase ID Token
   ▼
Express API
   │
   │ Verify token
   ▼
Firebase Admin
   │
   │ Valid
   ▼
Protected Controller
```

The backend therefore remains the authority for access to protected API resources.

---

# Authentication

Protected requests must include a Firebase ID token.

### Request

```http
GET /api/doctors
Authorization: Bearer <firebase-id-token>
```

### Authentication middleware

```text
src/middleware/auth.middleware.js
```

The middleware:

1. Reads the `Authorization` header.
2. Checks that the header contains a Bearer token.
3. Extracts the Firebase ID token.
4. Sends the token to Firebase Admin.
5. Verifies the token.
6. Rejects invalid requests with `401 Unauthorized`.
7. Allows valid requests to continue.

This means frontend route protection is not the only security layer. The backend independently verifies authentication.

---

# API Routes

## Health / Home

### Get API status

```http
GET /api/
```

Example:

```bash
curl http://localhost:5001/api/
```

This endpoint can be used to confirm that the server is running.

---

# Users API

Router:

```text
src/routers/user.route.js
```

| Method | Endpoint         | Description           | Auth     |
| ------ | ---------------- | --------------------- | -------- |
| GET    | `/api/users`     | Get users             | Required |
| GET    | `/api/users/:id` | Get user by ID        | Required |
| POST   | `/api/users`     | Create user           | Required |
| PUT    | `/api/users/:id` | Update user           | Required |
| PATCH  | `/api/users/:id` | Partially update user | Required |
| DELETE | `/api/users/:id` | Delete user           | Required |

---

# Doctors API

Router:

```text
src/routers/doctor.route.js
```

| Method | Endpoint           | Description             | Auth     |
| ------ | ------------------ | ----------------------- | -------- |
| GET    | `/api/doctors`     | Get doctors             | Required |
| GET    | `/api/doctors/:id` | Get doctor by ID        | Required |
| POST   | `/api/doctors`     | Create doctor           | Required |
| PUT    | `/api/doctors/:id` | Update doctor           | Required |
| PATCH  | `/api/doctors/:id` | Partially update doctor | Required |
| DELETE | `/api/doctors/:id` | Delete doctor           | Required |

---

# Patients API

Router:

```text
src/routers/patient.route.js
```

| Method | Endpoint             | Description              | Auth     |
| ------ | -------------------- | ------------------------ | -------- |
| GET    | `/api/patients`      | Get patients             | Required |
| GET    | `/api/patients/:id`  | Get patient by ID        | Required |
| POST   | `/api/patients`      | Create patient           | Required |
| POST   | `/api/patients/bulk` | Create multiple patients | Required |
| PUT    | `/api/patients/:id`  | Update patient           | Required |
| PATCH  | `/api/patients/:id`  | Partially update patient | Required |
| DELETE | `/api/patients/:id`  | Delete patient           | Required |

---

# Data Models

## User

Location:

```text
src/models/user.model.js
```

Primary fields include:

```text
name
email
password
active
role
```

The current application restricts the role to:

```text
admin
```

---

## Doctor

Location:

```text
src/models/doctor.model.js
```

Primary fields include:

```text
name
specialization
hospital
phone
email
patients
createdBy
createdAt
updatedAt
```

---

## Patient

Location:

```text
src/models/patient.model.js
```

Primary fields include:

```text
name
age
gender
condition
phone
email
doctor
createdBy
createdAt
updatedAt
```

---

# Example Requests

## Check API Status

```bash
curl http://localhost:5001/api/
```

---

## Create a User

```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123",
    "role": "admin",
    "active": true
  }'
```

---

## Get Doctors

```bash
curl http://localhost:5001/api/doctors \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

---

## Get a Specific Doctor

```bash
curl http://localhost:5001/api/doctors/DOCTOR_ID \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

---

## Get Patients

```bash
curl http://localhost:5001/api/patients \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

---

# Technical Decisions

## 1. Firebase Admin Token Verification Instead of Trusting the Frontend

Authentication is handled using Firebase Authentication on the frontend, but the backend does **not** simply trust that the frontend considers a user authenticated.

The frontend sends a Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

The backend verifies that token through Firebase Admin SDK.

### Why this approach?

A frontend is an untrusted environment. A malicious client can manually send HTTP requests without using the Doctorly UI.

Therefore, this is not sufficient:

```text
Frontend says:
"I am logged in."
```

The backend needs independently verifiable authentication:

```text
Frontend
   │
   │ ID Token
   ▼
Backend
   │
   │ Firebase Admin
   ▼
Token Verification
   │
   ├── Invalid → 401
   │
   └── Valid → Continue
```

This provides a strong security boundary around protected API resources.

### Benefits

- Centralized authentication verification
- Firebase handles identity management
- Backend does not need to implement password authentication
- Invalid or expired tokens are rejected
- Frontend and backend share the same authentication identity

Most importantly, **frontend route protection and backend authentication are treated as separate responsibilities**.

---

# 2. MongoDB + Mongoose Instead of Direct MongoDB Queries

Doctorly uses MongoDB for persistent healthcare data and Mongoose as the application's Object Data Modeling layer.

The architecture is:

```text
Controller
    ↓
Mongoose Model
    ↓
Mongoose Schema
    ↓
MongoDB
```

### Why Mongoose?

Without an ODM, database operations and validation logic can become scattered across controllers.

Mongoose provides:

- Schema definitions
- Validation
- Model abstraction
- Query helpers
- Middleware support
- Type-like structure around MongoDB documents
- Consistent database access patterns

For example, instead of placing database logic directly inside an Express route, Doctorly separates responsibilities:

```text
Route
  ↓
Controller
  ↓
Model
  ↓
MongoDB
```

This makes the backend easier to understand and maintain.

### Separation of Responsibilities

```text
Router
  │
  │ Defines endpoint
  ▼
Controller
  │
  │ Handles request/business logic
  ▼
Model
  │
  │ Defines data structure/database operations
  ▼
MongoDB
```

This architecture also makes it easier to extend the backend with additional resources such as appointments, prescriptions, or medical records in the future.

---

# Development Scripts

## Development

```bash
npm run dev
```

Runs the server with Nodemon if configured in `package.json`.

---

## Production

```bash
npm start
```

If `npm start` is not configured:

```bash
node index.js
```

---

## Formatting

```bash
npm run format
```

Formats the project using Prettier.

---

# Common Issues

## MongoDB Connection Error

Check:

```text
MONGODB_URI
```

Make sure:

- MongoDB is running locally, or
- MongoDB Atlas is accessible
- The connection string is valid
- The database user has the required permissions

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/doctorly
```

---

## Firebase Authentication Error

Check:

- Firebase Admin configuration
- Firebase project ID
- Service-account credentials or environment variables
- Frontend Firebase project
- Firebase ID token
- `Authorization` header

The request should contain:

```http
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

---

## `admin.auth is not a function`

If this error appears, verify how Firebase Admin is initialized and exported.

The backend should use the Firebase Admin SDK correctly and the middleware should receive the initialized Admin Auth instance rather than an incompatible import.

Check:

```text
src/config/firebase-admin.js
src/middleware/auth.middleware.js
```

Also ensure that the Firebase Admin SDK is initialized only once.

---

## CORS Error

The backend currently allows the Doctorly frontend origin.

For local development:

```text
http://localhost:3000
```

If the frontend runs somewhere else, update the CORS configuration in:

```text
index.js
```

For production, configure CORS using the actual production frontend origin rather than allowing arbitrary origins.

---

# Security Considerations

The backend is responsible for enforcing security even when the frontend has protected routes.

### Authentication

Protected endpoints require a valid Firebase ID token.

### Environment Variables

Sensitive configuration should not be committed.

Never commit:

```text
.env
serviceAccountKey.json
```

### Backend Authorization

Frontend route protection should never be considered sufficient authorization.

The backend should independently validate:

```text
Authentication
       +
Authorization
       +
Request validation
```

before modifying protected resources.

### CORS

CORS should be restricted to trusted frontend origins in production.

### Passwords

If passwords are stored or processed by the backend, they should never be stored as plaintext. Use `bcrypt` for password hashing where password-based credentials are actually part of the application's authentication/data model.

---

# Future Improvements

Potential backend improvements include:

- Role-based authorization
- Request schema validation
- Centralized error handling
- API response standardization
- Rate limiting
- API logging
- Request ID / tracing
- Automated unit tests
- Integration tests
- API documentation with OpenAPI/Swagger
- Server-side pagination
- Server-side filtering and sorting
- Database indexes for frequently queried fields
- Docker support
- CI/CD pipeline
- Production monitoring

---

# Production Deployment Checklist

Before deploying the API:

- [ ] Configure production MongoDB
- [ ] Configure Firebase Admin credentials securely
- [ ] Configure production frontend origin
- [ ] Set production environment variables
- [ ] Disable development-only configuration
- [ ] Verify protected routes
- [ ] Verify token expiration handling
- [ ] Test invalid authentication requests
- [ ] Test CRUD operations
- [ ] Add centralized error handling
- [ ] Enable HTTPS
- [ ] Configure logging and monitoring
- [ ] Verify database indexes
- [ ] Confirm secrets are not committed to Git

---

# Related Project

Doctorly consists of a Next.js frontend and this Express backend.

```text
Doctorly
│
├── Frontend
│   └── Next.js 16
│
└── Backend
    └── Node.js + Express
        │
        ├── Firebase Admin
        └── MongoDB
```

The frontend communicates with this server through the REST API.

---

# License

This project is currently intended for educational and portfolio purposes.

Add an appropriate license if the project is intended for public distribution.

---

# Author

**Doctorly**

Doctor Tracker management platform built with:

**Firebase · Express · MongoDB · Mongoose**
