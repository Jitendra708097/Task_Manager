# Task Manager

A full-stack Task Manager web app for creating projects, assigning team tasks, and tracking delivery progress with Admin and Member access.

## Role

Built as a Junior Software Developer portfolio project with a practical MERN-style architecture, REST APIs, NoSQL relationships, API-level validation, and a React client.

## Features

- Authentication with signup, login, logout, bcrypt password hashing, JWT, and httpOnly cookies.
- Role-based access control with `Admin` and `Member`.
- Project management for admins, including project members.
- Task creation, assignment, status tracking, priority, and due dates.
- Member task status updates.
- Dashboard summary for total tasks, project count, task status, overdue tasks, and assigned tasks.
- API validation using `express-validator`.
- Client form validation using React Hook Form and Zod.
- MongoDB relationships using Mongoose references.
- Optional Redis token blacklist support for logout invalidation.

## Tech Stack

### Server

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Token
- cookie-parser
- express-validator
- Redis
- CORS
- dotenv

### Client

- React.js
- Vite
- React Router DOM
- React Redux
- Redux Toolkit
- React Hook Form
- Zod
- `@hookform/resolvers`
- Tailwind CSS package is installed, with custom CSS currently used for the UI.

## Folder Structure

```text
Task_Manager/
  client/
    src/
      api/
      components/
      features/auth/
      pages/
      store/
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      validators/
```

## Server API

Base URL:

```text
http://localhost:3000/api
```

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Projects

- `GET /projects`
- `POST /projects` Admin only
- `GET /projects/:projectId`
- `PATCH /projects/:projectId` Admin only
- `DELETE /projects/:projectId` Admin only
- `GET /projects/users` Admin only

### Tasks

- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:taskId`
- `DELETE /tasks/:taskId`

Members can update task status. Admins and task creators can edit broader task details.

### Dashboard

- `GET /dashboard`

## Environment Variables

Create `server/.env`:

```env
PORT=3000
MONGO_DB_STRING=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

`REDIS_URL` is optional. If it is empty, the app still runs, but logout cannot blacklist JWTs server-side before they expire.

For the client, optional `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Run Locally

Install dependencies:

```bash
cd server
npm install

cd ../client
npm install
```

Start the API:

```bash
cd server
npm run dev
```

Start the client:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

## Railway Single URL Deployment

This project can be deployed as one Railway service. Express serves the React production build from `client/dist`, and the React app calls the API through `/api` on the same domain.

Railway service settings from the repository root:

```text
Build Command: npm run build
Start Command: npm start
```

Environment variables:

```env
MONGO_DB_STRING=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
CLIENT_URL=https://taskmanager-production-c5f0.up.railway.app
NODE_ENV=production
REDIS_URL=your_redis_url
```

Do not set `VITE_API_URL` for the single URL deployment unless you want to override the default. The default client API base is `/api`.

## Notes

- JWT is stored in an httpOnly cookie named `token`.
- CORS is configured for credentials.
- MongoDB documents use relationships through ObjectId references.
- Express validators guard request bodies, params, and query filters before controller logic runs.
- Admin users can create projects and manage project teams.
- Members can view their accessible projects/tasks and update task status.
