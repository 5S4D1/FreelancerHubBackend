# FreelancerHub API Documentation

Base URL: `http://localhost:3000`

All API routes are prefixed with `/api`.

---

## Authentication

Protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are returned by the **Login** endpoint and expire after **2 days**.

| Status | Meaning |
|--------|---------|
| `401` | Missing token |
| `403` | Invalid or expired token |

---

## Endpoints

### 1. Register

Create a new user account and an associated profile.

**`POST /api/register`**

**Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "freelancer"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `email` | string | Yes | — | User email (must be unique) |
| `password` | string | Yes | — | Plain-text password (hashed before storage) |
| `first_name` | string | No | `null` | Profile first name |
| `last_name` | string | No | `null` | Profile last name |
| `role` | string | No | `"freelancer"` | User role |

**Success Response — `201 Created`**
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

**Error Responses**

| Status | Body |
|--------|------|
| `400` | `{ "message": "Email and password are required" }` |
| `409` | `{ "message": "Email already registered" }` |
| `500` | `{ "message": "Server error" }` |

---

### 2. Login

Authenticate a user and return a JWT plus profile and dashboard stats.

**`POST /api/login`**

**Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

**Success Response — `200 OK`**
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
      "earning_history": [
        {
          "amount": 100.00,
          "type": "income",
          "status": "completed",
          "created_at": "2026-06-08T12:00:00.000Z"
        }
      ]
    }
  }
}
```

**Notes**
- If no avatar is set, `avatar_url` returns the default fallback image.
- `stats` aggregates data from `wallets`, `transactions`, `projects`, `bids`, and `tasks` tables.
- `earning_history` returns the 20 most recent transactions for the user.
- `payment_methods` is currently always an empty array (not yet implemented in the API).

**Error Responses**

| Status | Body |
|--------|------|
| `400` | `{ "message": "Email and password are required" }` |
| `401` | `{ "message": "Invalid email or password" }` |
| `500` | `{ "message": "Server error" }` |

---

### 3. Update Avatar

Upload or replace the authenticated user's profile avatar.

**`PUT /api/avatar`**

**Headers**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (form-data)**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `avatar` | file | Yes | Image file (max 5 MB) |

**Constraints**
- Only image MIME types are accepted (`image/*`).
- File is uploaded to Cloudinary under the folder `home/freelancerhub`.
- The profile `avatar_url` is updated in the database.

**Success Response — `200 OK`**
```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "https://res.cloudinary.com/.../image.jpg"
}
```

**Error Responses**

| Status | Body |
|--------|------|
| `400` | `{ "message": "Avatar image is required" }` |
| `401` | `{ "message": "Token required" }` |
| `403` | `{ "message": "Invalid token" }` |
| `500` | `{ "message": "Server error" }` |

---

### 4. Get Avatar

Retrieve the authenticated user's avatar URL.

**`GET /api/avatar`**

**Headers**
```
Authorization: Bearer <token>
```

**Success Response — `200 OK`**
```json
{
  "avatar_url": "https://res.cloudinary.com/.../image.jpg"
}
```

If no avatar has been uploaded, the fallback image URL is returned.

**Error Responses**

| Status | Body |
|--------|------|
| `401` | `{ "message": "Token required" }` |
| `403` | `{ "message": "Invalid token" }` |
| `404` | `{ "message": "Profile not found" }` |
| `500` | `{ "message": "Server error" }` |

---

## Health Check

**`GET /`**

Returns a simple HTML welcome page confirming the server is running.

---

## Database

**Database name:** `freelance_marketplace`

### Tables used by the API

| Table | Used By |
|-------|---------|
| `users` | Register, Login |
| `profiles` | Register, Login, Avatar |
| `wallets` | Login (balance stats) |
| `transactions` | Login (income & earning history) |
| `projects` | Login (project stats) |
| `bids` | Login (project stats) |
| `tasks` | Login (task stats) |
| `categories` | Service and project categories |
| `conversations` | Chat threads between users |
| `messages` | Messages within conversations |
| `reviews` | User reviews and ratings |
| `saved_items` | Bookmarked projects or tasks |
| `task_packages` | Pricing tiers for tasks |
| `timecards` | Work time tracking for projects |
| `education` | Profile education history |
| `work_experience` | Profile work experience history |

For the database schema and table definitions, see [DB_Schema.md](DB_Schema.md).

---

## Example Usage (cURL)

**Register**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"securePassword123"}'
```

**Login**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePassword123"}'
```

**Upload Avatar**
```bash
curl -X PUT http://localhost:3000/api/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/photo.jpg"
```

**Get Avatar**
```bash
curl -X GET http://localhost:3000/api/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
