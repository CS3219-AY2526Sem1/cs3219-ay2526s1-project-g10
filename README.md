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

The Matching Service automatically pairs users seeking a partner for coding sessions based on their selected difficulty and (preferably) topic. It uses Redis for queue management and temporary match/session storage, enabling fast, stateless matching between users.

#### **Mechanism**

1. When a user clicks “Find a Partner”, they are temporarily added to a Redis queue (waitingUsers).
2. The service continuously checks for another user with: the same difficulty, and ideally the same topic.
   2a. If a compatible user is found → a match is created for both users.
   2b. If no match is found within 60 seconds, the user is automatically removed to avoid stale entries.

#### **Architecture & Flow**

1. **User sends a match request** → backend checks Redis queue.
2. If the user is **not already in a match**, they are added to the `waitingUsers` queue (FIFO).
3. The service filters waiting users by:
   - Same **difficulty**, then
   - Same **topic** (if available).
4. When a suitable partner is found:
   - Two Redis keys are created:
     ```
     match:UserA → details of UserB
     match:UserB → details of UserA
     ```
   - Both users receive a **match result**.
5. Clients poll every few seconds until `matchFound = true`.
6. Once both users confirm, the backend:
   - Verifies both `match:` entries exist and point to each other.
   - Creates session entries (valid for **1 hour**):
     ```
     session:UserA
     session:UserB
     ```
   - Deletes temporary match keys.
   - Returns the shared `sessionId` to both clients.

#### **Integration with Collaboration Service**

Once both users confirm the match:

    Redis stores session metadata:
    ```json
    session:UserA = {
    "sessionId": "session-xyz",
    "partnerId": "UserB",
    "createdAt": 1730220000000
    }

The Collaboration Service retrieves this sessionId to connect both users into a shared real-time code editor.

#### **Design Decisions**

- **Stateless Scaling:** All temporary state stored in Redis → resilient even if servers restart.
- **Fast Matching:** O(1) Redis list lookups enable high-frequency polling.
- **Frontend Friendly:** Clients poll every 3 seconds for continuous updates.
- **Error Tolerant:** Auto-expiring keys (60 s) handle cleanup automatically.
- **Easy Integration:** Collaboration service only requires the sessionId to create a shared room.

#### **Technologies**

- **Node.js / Express** — API server
- **Redis** — queue, match, and session storage
- **Axios / WebSocket** — frontend communication (polling + updates)

#### **Edge Cases**

| **Scenario**                         | **Handling**                                                                  |
| :----------------------------------- | :---------------------------------------------------------------------------- |
| **User goes offline mid-match**      | Redis keys expire automatically after 60 s → partner re-queues automatically. |
| **User spams “Find Match”**          | Checks if `userId` already exists in queue → duplicates ignored.              |
| **Users confirm at different times** | Both must have matching Redis entries; otherwise, the match fails gracefully. |
| **Redis crash / restart**            | Safe — all data is transient, so users can simply retry.                      |
| **User cancels match**               | `/cancelMatching` removes the user from queue and deletes match keys.         |
| **User refreshes browser**           | Frontend polls `/startMatching` and reuses existing Redis match key.          |
| **Timeout (no match in 60 s)**       | User removed from queue → returns “Match timeout” to frontend.                |

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
