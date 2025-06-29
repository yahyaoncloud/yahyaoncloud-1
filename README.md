# yahyaoncloud — Personal Blog Platform

A full-stack blog platform designed for personal use, featuring a Go-based backend and a RemixJS frontend. It supports comprehensive blog functionality, portfolio management, Markdown editing, and admin-only access via GitHub SSO.

**Website:** [https://yahyaoncloud.vercel.app](https://yahyaoncloud.vercel.app)

## Overview

- **Backend:** Pure Go HTTP server using `net/http`
- **Frontend:** RemixJS with TailwindCSS
- **Database:** MongoDB Atlas
- **Storage:** Firebase for image uploads
- **Authentication:** GitHub SSO with JWT
- **Containerization:** Single Docker image
- **Deployment:** Backend on Render.com, Frontend on Vercel

## Architecture

```plaintext
project-root/
├── app/                    # Remix frontend
├── backend/                # Go backend (net/http)
│   ├── controllers/        # Request handlers
│   ├── models/            # Data structures
│   ├── routes/            # API routing
│   ├── services/          # Business logic
│   ├── middlewares/       # Request middleware
│   ├── swagger/           # API documentation
│   └── main.go            # Entry point
├── snapshot/              # Documentation screenshots
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Local development setup
└── README.md              # Project documentation
```

## Snapshot

Blog homepage:

![Blog Homepage](./snapshot/blog-home.png)

## Features

### Blog System
- Markdown-based content with image embedding
- Cover image upload with live preview
- SEO metadata (title, slug, description, keywords)
- Tags (free-form) and categories (selectable or custom)
- Public read-only access to all published content

### Admin Interface
- Protected routes under `/admin`
- Access restricted to GitHub user `tunkstun` or email `ykinwork1@gmail.com`
- Blog post management (Create, Read, Update, Delete)
- Real-time image drag-and-drop embedding

### Portfolio
- View and edit personal info, experience, skills, and certifications
- Data managed through secure backend endpoints

## Backend (Go)

- Built with pure Go using `net/http`
- MongoDB Atlas for persistent storage
- JWT-based session handling
- GitHub OAuth for secure authentication
- RESTful API routing with `http.ServeMux`
- Swagger documentation generated via `swag init`

### Example API Endpoints

| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| GET    | `/api/posts`         | List all blog posts       |
| POST   | `/api/posts`         | Create a blog post        |
| PUT    | `/api/posts/:id`     | Update a blog post        |
| DELETE | `/api/posts/:id`     | Delete a blog post        |
| GET    | `/portfolio`         | Retrieve portfolio data   |
| PUT    | `/portfolio`         | Update portfolio data     |

Swagger documentation is available at `/swagger/index.html`.

## Frontend (RemixJS)

- Static frontend hosted on Vercel
- Styled with TailwindCSS for utility-first design
- Framer Motion for smooth UI transitions
- Session-aware loaders for route-level security
- Admin dashboard with Markdown editor and image uploader

## Deployment

- **Frontend:** Deployed on [Vercel](https://vercel.com)
- **Backend:** Deployed on [Render](https://render.com)
- **Database:** Hosted on [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Storage:** Images stored on [Firebase Storage](https://firebase.google.com/products/storage)

### Local Development
To run the application locally:

```bash
docker-compose up --build
```

Ensure you have Docker and Docker Compose installed. Configure environment variables (e.g., MongoDB URI, Firebase credentials, GitHub OAuth keys) in a `.env` file.

## Completed Work

- JWT and GitHub SSO integration
- Blog post and portfolio CRUD operations
- Markdown content rendering
- Tag and category metadata support
- Image upload via Firebase
- Swagger-based API documentation
- Session-based protected routes in Remix
- Single-container Docker setup

## Work in Progress

- Authentication context propagation in Remix
- Role-based route protection for future user types
- Like and comment feature with moderation
- Category-to-post mapping optimization
- Search functionality (title, content, tags)
- SSO token cleanup and logout flow
- Search UI with live filtering

## Access Control

- **Admin Panel:** Restricted to:
  - GitHub: `tunkstun`
  - Email: `ykinwork1@gmail.com`
- **Public Routes:** Readable without authentication
- **API Write Operations:** Protected by JWT

## License

This project is licensed under the MIT License.
