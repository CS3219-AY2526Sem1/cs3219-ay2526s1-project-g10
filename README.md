[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)

# CS3219 Project (PeerPrep) - AY2526S1

## Group: G10

### Note:

- You are required to develop individual microservices within separate folders within this repository.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements.

---

## Overview

PeerPrep is a web-based platform that allows users to solve coding problems with real-time collaboration.

## Services and Features

### User Service

### Question Service

### Matching Service

### Collaboration Service

### Live Chat

### Question Attempt History

### Custom Matching Rooms

### AI Assisted Problem-Solving and Chatbot

### API-Gateway

The API Gateway is a self-hosted Express.js gateway that consolidates all service endpoints behind a single access point. The gateway handles authentication, routing, and traffic control before forwarding requests to internal services. As the project scales with more services, it helps to simplify communication and improve scalability.

#### **Design Decisions**

- **Gateway Type:** Express.js for full control over middleware, security and integration flexibility
- **Routing Rules:**
  - '/users' -> User Service
  - '/questions' -> Question Service
  - '/match' -> Matching Service
  - '/collab' -> Collaboration Service
- **Authentication:** Middleware validates JWTs before forwarding protected requests
- **Rate Limiting:** Implemented 100 requests / 15 minutes per IP to prevent abuse or spam of requests
- **CORS:** Enabled globally to allows frontend requests
- **Health Check:** `/healthz` endpoint to verify gateway service, health checks and uptime monitoring

- **Future Enhancements:** Load Balancing - can integrate load balancing logic or connect with container orchestration tools e.g., Kubernetes to evenly distribute requests.
- **Challenges faced:** Configuring routing rules correctly across multiple microservices, especially for Question fetching service

#### **Technologies**

- `Express.js` – Server framework
- `express-http-proxy` – Request forwarding
- `jsonwebtoken` – JWT verification
- `express-rate-limit` – Request throttling
- `cors` – Cross-origin support

---

## Tech Stack

### Languages & Frameworks

- **Node.js** (JavaScript runtime) – to run backend code
- **Express.js** – to define routes, handle middleware, and create REST APIs

### Database Layer

- **PostgreSQL** – database used
- **Supabase** – host PostgreSQL database

### Authentication & Security

- **JWT** (JSON Web Token) – for session handling and user authentication
- **Supabase Auth** – for signup, login, password reset, etc.

---

## Architecture Diagrams

---

## Screenshots

---
