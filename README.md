# FreelancerHub Backend

REST API backend for **FreelancerHub** — a freelancer marketplace platform. Handles user authentication, profile management, and avatar uploads, with dashboard stats loaded on login (wallet, projects, tasks, and transactions).

Built with **Node.js**, **Express**, and **MySQL**.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MySQL (mysql2) |
| Auth | JWT + bcryptjs |
| File Storage | Cloudinary |
| Upload | Multer |

---

## Project Structure

```
FreelancerHubBackend/
├── CDN/
│   └── cloudinary.js          # Cloudinary configuration
├── controllers/
│   ├── authController.js      # Register & login logic
│   └── avatarController.js    # Avatar upload & retrieval
├── DB/
│   └── connect.js             # MySQL connection pool
├── Doc/
│   └── API_Documentation.md   # Full API reference
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   └── uploadAvatar.js        # Multer image upload config
├── routes/
│   ├── auth.js                # /api/register, /api/login
│   └── avatar.js              # /api/avatar
├── .env                       # Environment variables (not committed)
├── index.js                   # App entry point
└── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- MySQL server with the FreelancerHub database schema
- [Cloudinary](https://cloudinary.com/) account (for avatar uploads)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd FreelancerHubBackend
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=freelance_marketplace

JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start the server

```bash
node index.js
```

The server runs at **http://localhost:3000**.

---

## API Overview

All routes are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/register` | No | Create a new user account |
| `POST` | `/api/login` | No | Login and receive JWT + dashboard stats |
| `PUT` | `/api/avatar` | Yes | Upload or replace profile avatar |
| `GET` | `/api/avatar` | Yes | Get current avatar URL |

For full request/response schemas, error codes, and cURL examples, see **[Doc/API_Documentation.md](Doc/API_Documentation.md)**.

---

## Authentication Flow

1. **Register** — `POST /api/register` with email and password.
2. **Login** — `POST /api/login` returns a JWT (valid for 2 days).
3. **Protected requests** — include the token:

   ```
   Authorization: Bearer <token>
   ```

---

## Database

**Database name:** `freelance_marketplace`

### Tables currently used by the API

| Table | Purpose |
|-------|---------|
| `users` | User accounts (email, password, role) |
| `profiles` | User profile data (name, avatar, freelancer info) |
| `wallets` | User wallet balances |
| `transactions` | Income and withdrawal history |
| `projects` | Client/freelancer projects |
| `bids` | Project bids |
| `tasks` | Freelancer task listings |
| `categories` | Service and project categories |
| `conversations` | Chat threads between users |
| `messages` | Messages within conversations |
| `reviews` | User reviews and ratings |
| `saved_items` | Bookmarked projects or tasks |
| `task_packages` | Pricing tiers for tasks (e.g. basic, standard, premium) |
| `timecards` | Work time tracking for projects |
| `education` | Profile education history |
| `work_experience` | Profile work experience history |

---

## License

ISC
