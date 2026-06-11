# FreelancerHub API Documentation

**Base URL:** `http://localhost:3000`  
**API Prefix:** `/api`  
**Auth:** Bearer JWT  
**Database:** `freelance_marketplace`

This document reflects the current codebase in `routes/`, `controllers/`, and `middleware/`.

---

## Table of Contents

- [Authentication](#authentication)
- [Status Codes](#status-codes)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Register](#register)
  - [Login](#login)
  - [Get Profile](#get-profile)
  - [Update Profile](#update-profile)
  - [Update User ID](#update-user-id)
  - [Update Avatar](#update-avatar)
  - [Get Avatar](#get-avatar)
  - [Get Project Categories](#get-project-categories)
  - [Add Project Category](#add-project-category)
  - [Get Projects](#get-projects)
  - [Create Project](#create-project)
  - [Update Project](#update-project)
  - [Delete Project](#delete-project)
- [Database Reference](#database-reference)
- [Examples](#examples)

---

## Authentication

Protected routes require a JWT in the `Authorization` header.

```http
Authorization: Bearer <token>
```

Auth middleware responses:

| Status | Message |
|--------|---------|
| `401` | `Token required` |
| `403` | `Invalid token` |

Role middleware response:

| Status | Message |
|--------|---------|
| `403` | `Access denied. Insufficient permissions.` |

Token is issued by the login endpoint and expires in `2d`.

---

## Status Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not found |
| `409` | Conflict |
| `500` | Server error |

---

## Endpoints

### Health Check

**`GET /`**

Returns a simple HTML response confirming the server is running.

Success response:

```html
<h1>Welcome!</h1><p>FreelancerHub running..</p>
```

---

### Register

**`POST /api/register`**

Creates a new user and a minimal profile row.

Request body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "freelancer"
}
```

Notes:

- `role` defaults to `freelancer`.
- `first_name` and `last_name` are optional.
- Password is hashed with `bcryptjs` before storage.

Success response `201`:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "freelancer"
  }
}
```

Error responses:

| Status | Message |
|--------|---------|
| `400` | `Email and password are required` |
| `409` | `Email already registered` |
| `500` | `Server error` |

---

### Login

**`POST /api/login`**

Authenticates a user and returns a JWT plus profile and dashboard stats.

Request body:

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Success response `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "freelancer",
    "status": "active",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://res.cloudinary.com/.../fallback_img.png",
      "freelancer_type": null
    },
    "stats": {
      "total_income": 0,
      "withdraw_request": 0,
      "pending_income": 0,
      "available_in_account": 0,
      "completed_projects": 0,
      "ongoing_projects": 0,
      "canceled_projects": 0,
      "tasks_sold": 0,
      "ongoing_tasks": 0,
      "canceled_tasks": 0,
      "payment_methods": [],
      "earning_history": []
    }
  }
}
```

Notes:

- `avatar_url` falls back to a default image when empty.
- Dashboard stats are assembled from `wallets`, `transactions`, `projects`, `bids`, and `tasks`.
- `payment_methods` is currently an empty array in code.

Error responses:

| Status | Message |
|--------|---------|
| `400` | `Email and password are required` |
| `401` | `Invalid email or password` |
| `500` | `Server error` |

---

### Get Profile

**`GET /api/profile`**

Returns the authenticated user's joined profile record.

Required header:

```http
Authorization: Bearer <token>
```

Success response `200` returns the combined user/profile row with fields similar to:

```json
{
  "id": "uuid",
  "email": "john@example.com",
  "role": "freelancer",
  "status": "active",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://...",
  "location": null,
  "freelancer_type": null,
  "english_level": "conversational",
  "hourly_rate": 0,
  "hours_per_week": 40,
  "response_time": null,
  "about": null,
  "avg_rating": 0,
  "total_reviews": 0,
  "happy_clients": 0,
  "projects_done": 0,
  "languages": null
}
```

The controller currently does not return a custom 404 if the profile is missing.

---

### Update Profile

**`PUT /api/profile`**

Updates the authenticated user's profile fields.

Required header:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "location": "London",
  "freelancer_type": "Designer",
  "english_level": "fluent",
  "hourly_rate": 25,
  "hours_per_week": 30,
  "response_time": "within 24 hours",
  "about": "I build clean interfaces."
}
```

Success response `200`:

```json
{
  "message": "Profile updated successfully"
}
```

Error response `500`:

```json
{
  "error": "Internal server error"
}
```

---

### Update User ID

**`PUT /api/profile/uid`**

Updates the authenticated user's `users.id` value.

Required header:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "new_user_id": "new-uuid-here"
}
```

Notes:

- The code checks for an existing user with the new ID first.
- The database is expected to cascade the new ID to related rows.

Success response `200`:

```json
{
  "message": "User ID updated successfully"
}
```

Error responses:

| Status | Message |
|--------|---------|
| `400` | `User ID already exists` |
| `500` | `Internal server error` |

---

### Update Avatar

**`PUT /api/avatar`**

Uploads a new avatar image to Cloudinary and updates `profiles.avatar_url`.

Required header:

```http
Authorization: Bearer <token>
```

Content type:

```http
multipart/form-data
```

Form field:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `avatar` | file | Yes | Image only, max 5 MB |

Constraints:

- Only `image/*` mime types are accepted.
- Uploads are stored in Cloudinary folder `home/freelancerhub`.

Success response `200`:

```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "https://res.cloudinary.com/.../image.jpg"
}
```

Error responses:

| Status | Message |
|--------|---------|
| `400` | `Avatar image is required` |
| `401` | `Token required` |
| `403` | `Invalid token` |
| `500` | `Server error` |

---

### Get Avatar

**`GET /api/avatar`**

Returns the authenticated user's avatar URL.

Required header:

```http
Authorization: Bearer <token>
```

Success response `200`:

```json
{
  "avatar_url": "https://res.cloudinary.com/.../image.jpg"
}
```

If the profile has no avatar, the fallback Cloudinary URL is returned.

Error responses:

| Status | Message |
|--------|---------|
| `401` | `Token required` |
| `403` | `Invalid token` |
| `404` | `Profile not found` |
| `500` | `Server error` |

---

### Get Project Categories

**`GET /api/categories`**

Returns all project categories.

This endpoint is public.

Success response `200` is an array of category rows from the `categories` table.

---

### Add Project Category

**`POST /api/categories`**

Creates a new project category.

Required header:

```http
Authorization: Bearer <token>
```

Role required: `admin`

Request body:

```json
{
  "name": "Design",
  "slug": "design",
  "icon_url": "https://example.com/icon.png"
}
```

`icon_url` is optional.

Success response `200`:

```json
{
  "message": "Project Categories add successfully.",
  "id": 12,
  "name": "Design",
  "slug": "design",
  "icon_url": "https://example.com/icon.png"
}
```

Error responses:

| Status | Message |
|--------|---------|
| `400` | `Name and slug are required.` |
| `403` | `Access denied. Insufficient permissions.` |
| `500` | `Server error` |

---

### Get Projects

**`GET /api/projects`**

Returns all project rows.

This endpoint is public.

Success response `200` is an array of rows from the `projects` table.

---

### Create Project

**`POST /api/projects`**

Creates a new project for the authenticated client.

Required header:

```http
Authorization: Bearer <token>
```

Role required: `client`

Request body:

```json
{
  "title": "Build landing page",
  "description": "Need a modern landing page",
  "category_id": 1,
  "price_type": "fixed",
  "min_price": 100,
  "max_price": 300,
  "experience_level": "entry",
  "job_type": "remote",
  "status": "open",
  "hiring_capacity": 1
}
```

Required fields: `title`, `description`

Success response `201`:

```json
{
  "message": "Project created successfully",
  "projectId": 1
}
```

Note: the current code returns `result.insertId` as `projectId`.

Error responses:

| Status | Message |
|--------|---------|
| `400` | `Title, description, and client_id are required` |
| `403` | `Access denied. Insufficient permissions.` |
| `500` | `Server error` |

---

### Update Project

**`PUT /api/projects/:id`**

Updates an existing project owned by the authenticated client or an admin.

Required header:

```http
Authorization: Bearer <token>
```

Role required: `client` to access the route, with admin override inside the controller.

Path parameter:

| Parameter | Description |
|-----------|-------------|
| `id` | Project UUID |

Request body:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "ongoing",
  "category_id": 1,
  "price_type": "fixed",
  "min_price": 150,
  "max_price": 400,
  "experience_level": "intermediate",
  "job_type": "remote",
  "hiring_capacity": 2
}
```

Required fields: `title`, `description`

Success response `200`:

```json
{
  "message": "Project updated successfully",
  "projectId": "<id>"
}
```

Error responses:

| Status | Message |
|--------|---------|
| `400` | `Title and description are required` |
| `403` | `You can only update your own projects` |
| `404` | `Project not found` |
| `500` | `Server error` |

---

### Delete Project

**`DELETE /api/projects/:id`**

Deletes an existing project owned by the authenticated client or an admin.

Required header:

```http
Authorization: Bearer <token>
```

Role required: `client` to access the route, with admin override inside the controller.

Path parameter:

| Parameter | Description |
|-----------|-------------|
| `id` | Project UUID |

Success response `200`:

```json
{
  "message": "Project deleted successfully",
  "projectId": "<id>"
}
```

Error responses:

| Status | Message |
|--------|---------|
| `403` | `You can only delete your own projects` |
| `404` | `Project not found` |
| `500` | `Server error` |

---

## Database Reference

The full schema and foreign key matrix live in [DB_Schema.md](DB_Schema.md).

---

## Examples

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"securePassword123"}'
```

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePassword123"}'
```

```bash
curl -X GET http://localhost:3000/api/projects
```

```bash
curl -X PUT http://localhost:3000/api/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/photo.jpg"
```
