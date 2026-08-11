# Backend Concept Visualizer

An interactive, visual learning platform designed to demystify backend engineering. Instead of relying on abstract definitions, this platform enables users to send real HTTP requests to a live Node.js/Express backend and visually trace their execution through every architectural layer.

## Platform Scale and Scope

- **10** Core Modules spanning the entire backend ecosystem
- **60+** Distinct Engineering Topics mapped
- **30** Live API Endpoints implemented across 4 primary modules (HTTP, REST, Auth, Notifications)
- **1** Live Express.js Server with custom request tracing middleware
- **6** Architectural Layers visualized in real-time (HTTP → Express → Controller → Service → Prisma → Response)

---

## Core Vision

Backend engineering often operates as a black box. When an HTTP request is made, it is processed out of sight, eventually returning a response. This project aims to make the invisible visible.

By combining an interactive React frontend with a heavily instrumented Express/Prisma/PostgreSQL backend, learners can execute deliberate experiments (such as omitting required validation fields or modifying pagination parameters) and observe exactly how the backend routes, parses, queries, and responds.

---

## Curriculum Roadmap

The platform is structured into **10 distinct modules**. 

### 01. Internet & HTTP 
- [x] Client / Server
- [x] DNS (Conceptual)
- [x] HTTP Fundamentals
- [x] Requests / Responses
- [x] Headers
- [x] Status codes (e.g., dynamic `/status/:code` endpoints)
- [x] Redirects & Caching mechanics

### 02. APIs
- [x] REST Fundamentals
- [x] Routes & HTTP Methods
- [x] Query parameters (Pagination, Filtering, Sorting)
- [x] Request bodies
- [x] Server-side Validation
- [ ] API versioning

### 03. Authentication
- [x] Passwords & Hashing (Register/Login)
- [x] Cookies & Sessions
- [x] JWT (JSON Web Tokens)
- [x] Refresh tokens
- [x] Protected Routes
- [ ] OAuth
- [ ] RBAC (Role-Based Access Control)

### 04. Databases 
- [ ] SQL vs NoSQL
- [x] PostgreSQL Integration (Prisma)
- [ ] Indexes & Performance
- [ ] ACID Transactions
- [ ] Isolation Levels
- [ ] Connection pools

### 05. Caching 
- [ ] Cache fundamentals
- [ ] Redis Integration
- [ ] TTL (Time To Live)
- [ ] Cache-aside pattern
- [ ] Cache Invalidation
- [ ] Distributed caching

### 06. Async Systems 
- [ ] Background jobs
- [ ] Message Queues
- [ ] Workers
- [ ] RabbitMQ
- [ ] Kafka
- [ ] Event-driven architectures

### 07. Real-time 
- [ ] Short & Long Polling
- [ ] SSE (Server-Sent Events)
- [ ] WebSockets
- [ ] Pub/Sub Patterns

### 08. Backend Security 
- [ ] CORS (Cross-Origin Resource Sharing)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] XSS (Cross-Site Scripting)
- [ ] SQL injection prevention
- [ ] Rate limiting
- [ ] OWASP top concepts

### 09. Scaling (Planned)
- [ ] Vertical scaling
- [ ] Horizontal scaling
- [ ] Load balancing
- [ ] Reverse proxies
- [ ] Database Replication
- [ ] Database Sharding

### 10. Distributed Systems 
- [ ] CAP theorem
- [ ] Consistency models
- [ ] Distributed locks
- [ ] Idempotency
- [ ] Message delivery guarantees
- [ ] Failure handling

---

## Technical Stack

### Frontend (Visualizer)
- Next.js (React)
- TailwindCSS
- Interactive Request Builders
- Real-time Execution Trace Visualization

### Backend (Engine)
- Node.js & Express
- Custom Request Tracing Middleware
- Prisma ORM
- PostgreSQL

---

## Getting Started

*(Instructions for setting up the local database, starting the Express server, and running the Next.js frontend will go here.)*
