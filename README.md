# School System (Beginner Node.js Project)

This is a simple **school management API** built with **Node.js + Express** for beginners.

## Roles

- **Admin**: Full access (users, courses, student registrations)
- **Teacher**: View own courses and add/update marks
- **Student**: View own registrations and marks

## Quick Start

```bash
npm install
npm start
```

Server starts at `http://localhost:3000`.

## Demo Login Accounts

- Admin: `admin@school.com` / `admin123`
- Teacher: `teacher@school.com` / `teacher123`
- Student: `student@school.com` / `student123`

## Main Endpoints

### Public

- `POST /login`

### Admin

- `GET /admin/users`
- `POST /admin/courses`
- `POST /admin/registrations`

### Teacher

- `GET /teacher/courses`
- `POST /teacher/marks`

### Student

- `GET /student/registrations`
- `GET /student/marks`

## Auth

After login, send token in the request header:

```http
x-auth-token: <your-token>
```
