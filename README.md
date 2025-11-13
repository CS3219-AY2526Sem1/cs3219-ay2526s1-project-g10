[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)

# CS3219 Project (PeerPrep) - AY2526S1

## Group: G10

### Note:

- You are required to develop individual microservices within separate folders within this repository.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements.

---

## Overview

PeerPrep is a web-based platform that allows users to solve coding problems with real-time collaboration.

| Services | Description                                                                                                                        | 
|----------|------------------------------------------------------------------------------------------------------------------------------------|
| User Service | Manages user authentication, profiles, and roles (admin/user).                                                                     |
| Question Service | Manages coding questions, including CRUD operations and categorization by difficulty and topic && logs question attempts by users. |
| Matching Service | Matches users based on their chosen topic and difficulty for collaborative coding sessions.                                        |
| Collaboration Service | Facilitates real-time collaborative coding sessions using WebSockets.                                                        | 
| API Gateway | Serves as a single entry point for all client requests, routing them to the appropriate microservices.                             |

| Enhanced Features | Description                                                                                                                        |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Live Chat | Enables real-time text communication between users during collaborative coding sessions.                                               |
| Question Attempt History | Tracks and stores users' question attempt history for review and analysis.                                                        |
| Custom Matching Rooms | Allows users to create or join custom rooms for collaborative coding sessions with specific settings.                                      |
| AI Assisted Problem-Solving and Chatbot | Provides AI assistance during coding sessions, including hints and explanations.                                      | 
---
## Services and Features

### User Service

The User Service is responsible for managing user accounts, authentication, and authorization within the PeerPrep platform. It serves as the central entry point for all user-related operations, ensuring secure and consistent identity management across microservices.

#### **Core Responsibilities:**

- Handle **user registration**, **login**, and **logout** securely through Supabase Authentication
- Manage **user profiles**, including fetching, updating, and deleting account data
- Generate and validate **JWT tokens** for authenticated routes
- Integrate with other microservices (e.g., Matching and Collaboration) to verify user identity before granting access
- Provide **email confirmation** and **password recovery** flows via Supabase’s built-in Auth API

---

#### **Tech Stack:**

- **Node.js + Express.js** – Core backend framework for route handling and middleware
- **Prisma ORM** – Simplifies database queries and migrations
- **PostgreSQL (via Supabase)** – Stores user data securely in a managed environment
- **Supabase Auth** – Provides built-in authentication, email verification, and password reset
- **JWT (JSON Web Token)** – Used for access control and user session validation

---

#### **Integration Details:**

- Connected to frontend login & signup pages through RESTful API calls
- Tokens generated here are attached to requests sent to Matching and Collaboration services for verification
- Includes error handling and validation middleware for consistent API responses

### Question Service
**Purpose:** To manage coding questions, including CRUD operations and categorization by difficulty and topic.
 - Stores a large volume of coding questions.
 - Currently also logs question attempts by users.

**Key Features:**
 - CRUD operations for coding questions.
 - Fetch random questions by difficulty and topic.
 - Maintain attempt history and fetch attempts by user(timestamp, status, etc.)

**Design Specifications:**
1. Admins can create, read, update, and delete coding questions.
2. Users can fetch random questions based on selected difficulty and topic.
3. The service logs each user's attempts at solving questions, including timestamps and status (e.g., completed, pending)
4. Users can retrieve their attempt history for review and analysis.
5. The service exposes RESTful APIs for interaction with other services and the frontend.
6. The service uses a PostgreSQL database to store question data and attempt logs.

**Query patterns:**
  - Filter query by difficulty and topic (GET /questions?difficulty=&topic=)
  - Use conditional filter and return question that match the difficulty/topic specified 
  - Pick a random question from the filtered set 
  - Pagination 
  - Paged retrieval of qns(100 per page) (GET /questions)

**APIs (examples):**
- `POST /questions` - Create a new coding question (Admin only)
- `GET /questions` - Retrieve a list of all coding questions
- `GET /questions/random?difficulty={difficulty}&topic={topic}` - Fetch a random question based on difficulty and topic
- `GET /questions/{questionId}` - Retrieve details of a specific question
- `PUT /questions/{questionId}` - Update a specific coding question (Admin only)
- `DELETE /questions/{questionId}` - Delete a specific coding question (Admin only)
- `PATCH /questions/{questionId}` - Partially update a specific coding question (Admin only)

**Scaling and Design considerations**
*API Design (REST)*
  - Easy to extend to other services such as /questions/:id for specific question
*Error handling*
  - If query fails, exceptions are gracefully handled and return standard 500 responses 
  - If no questions match criteria, ("No questions found matching the criteria")
*DB Scalability(future possibilities)*
  - Supabase supports horizontal scaling and read replicas so as num of questions grows it can distribute read queries across replicas to reduce loads 
  - Future possibility as DB grows(Sharding - splitting data by category into multiple db, running on different servers)
  - Caching -> Frequently accessed questions (e.g., popular ones or easy level) can be cached in Redis to further reduce database load

**Integration with user service:**
- The question service will interact with the user service to verify user identities and roles 
  when performing operations that require authentication or authorization.
- Requests to display data include JWT in the Authorization header for user verification.
- Backend for both services will validate the JWT to ensure secure communication.
- If validation is successful, question / attempts can be processed accordingly.

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

The Collaboration Service powers real-time pair programming inside PeerPrep. It exposes a REST surface for AI chat and health checks, while the primary communication happens over a WebSocket endpoint backed by **Yjs** shared documents. Every coding room is represented by a Yjs doc that keeps editor content, output panels, and room chat in sync across participants.

#### **Core Responsibilities**

- Maintain low-latency WebSocket connections so participants see live cursor and text updates
- Persist shared editor state in-memory using Yjs documents that automatically handle conflict resolution
- Broadcast shared outputs (e.g., code execution results) and room chat messages to all peers
- Host the Gemini chatbot entrypoint (`POST /ai/chat`) for AI-assisted hints and debugging tips
- Provide `/healthz` and `/` HTTP probes for Cloud Run readiness checks

#### **Real-Time Architecture**

1. Clients connect to `wss://<service>/collab?room=<sessionId>` after the Matching Service issues a session token.
2. The service normalises the `room` query and maps it to a Yjs document name; new documents are created on demand.
3. `y-websocket` handles CRDT sync: each keystroke or cursor move mutates the shared doc and is reconciled across peers without locks.
4. When a client disconnects, Yjs automatically garbage-collects orphaned updates, keeping memory usage predictable.
5. HTTP upgrades are guarded so only the configured `COLLAB_WS_PATH` is accepted; everything else is rejected early to conserve resources.
6. Allowed origins are restricted through `COLLAB_ALLOWED_ORIGINS`, ensuring only approved frontends can establish CORS or WS connections.

#### **Integration Points**

- **Matching Service** supplies the `sessionId` that becomes the collaboration room identifier.
- **History Service** listens for code/output updates (via the frontend) and persists the latest attempt snapshot whenever shared output changes.
- **Frontend** uses `NEXT_PUBLIC_COLLAB_WS_URL` to point the editor at the deployed WebSocket endpoint and hydrates the Monaco editor via Yjs bindings.
- **AI Chatbot** consumes the same room context by sending question, code, and user prompts to `/ai/chat`, which forwards requests to Google Gemini.

#### **Endpoints & Protocols**

| Type | Path | Description |
|------|------|-------------|
| HTTP | `GET /` | Basic readiness probe | 
| HTTP | `GET /healthz` | Cloud Run health check |
| HTTP | `POST /ai/chat` | Gemini-backed assistant responses |
| WS | `GET /collab` | Upgraded to WebSocket; synchronises editor, output, and room chat |

#### **Technologies**

- **Express + Node.js** for HTTP routing and upgrade negotiation
- **ws** for lightweight WebSocket server management
- **Yjs + y-websocket** for conflict-free shared state replication
- **dotenv + configurable env vars** (`COLLAB_ALLOWED_ORIGINS`, `COLLAB_WS_PATH`, `GEMINI_API_KEY`) for deploy-time flexibility

#### **Operational Considerations**

- Designed as a single-process server so Cloud Run instances can handle both HTTP and WS traffic without sidecars.
- Gracefully rejects invalid upgrade requests to avoid accidental DOS from incorrect paths.
- Ready for horizontal scaling: each instance is stateless beyond in-memory Yjs docs; clients reconnect and resync automatically when moved between instances.

### Live Chat

The Live Chat feature is embedded inside the collaboration sidebar to let matched partners exchange messages without leaving the shared editor. Messages ride on the same Yjs document as the code editor, so chat history and typing indicators stay perfectly in sync even when participants reconnect.

#### **Core Responsibilities**

- Provide a low-latency text channel that mirrors in real time across all collaborators
- Persist the active conversation in the shared Yjs array so late joiners can replay context instantly
- Auto-scroll and group messages by sender, making it easy to follow the discussion alongside the code
- Respect the same room lifecycle as the editor (cleanup happens when the room shuts down)

#### **How It Works**

1. When the editor mounts, the frontend calls `ydoc.getArray("chat")` to retrieve a shared Yjs array.
2. Sending a message pushes `{ id, text, ts }` into the array; Yjs emits updates to every connected peer.
3. Listeners sort messages by timestamp to guarantee chronological ordering, then render them in the chat pane.
4. Each client reuses the y-websocket awareness client ID to tag its own messages; recipients see a clear “You” vs “User <id>” badge.
5. When the component unmounts, observers detach so there are no memory leaks across room switches.

#### **Integration Points**

- Shares the same WebSocket connection as the code editor (`/collab`), so no additional network channels are required.
- Works alongside the AI Assistant tab: users can toggle between peer chat and Gemini responses while remaining in the same UI surface.
- History service updates piggyback on the same Yjs document; whenever output changes, chat remains available for audit context.


### Question Attempt History
Purpose: To track and store users' question attempt history for review and analysis.
- Help users keep track of their progress and performance over time.

**Key Features:**
 - Logs each user's attempts at solving questions (timestamp, status, submitted code, output etc)
 - Allows users to retrieve their attempt history.
 - Expose RESTful APIs for interaction with other services and the frontend.
 - Uses a PostgreSQL database to store attempt logs.

**Design Specifications:**
1. An attempt is created once a user joins a collaboration room for a specific question.
2. The attempt is updated with the user's submitted code and output when they run the code.
3. Users can retrieve their attempt history, including timestamps, status, submitted code, and output.

**APIs (examples):**
- `POST /attempts` - Create a new attempt record when a user starts solving a question
- `GET /attempts/user/{userId}` - Retrieve all attempts made by a specific user
- `GET /attempts/{attemptId}` - Retrieve details of a specific attempt
- `PATCH /attempts/{attemptId}` - Update a specific attempt with submitted code and output


### Custom Matching Rooms
Users can create or join custom rooms to collaborate with friends.

**Custom Room Creation:**
1. User navigates to the matching page.
2. User clicks `Create/Join Custom Room` button.
3. User clicks `Create Room` button.
4. User selects difficulty and topic of choice, then sets a room password.
5. User clicks `Create Room` button.
6. Room code is displayed to the user.
7. User is redirected to the custom room collaboration page.

**Joining a Custom Room:**
1. User navigates to the matching page.
2. User clicks `Create/Join Custom Room` button.
3. User clicks `Join Room` button.
4. User enters room code and password.
5. User clicks `Join Room` button.
6. User is redirected to the custom room collaboration page.

### AI Assisted Problem-Solving and Chatbot (Google Gemini Integration)

The **AI-Assisted Problem-Solving Chatbot** enhances PeerPrep’s collaborative coding experience by integrating **Google Gemini**, an advanced large language model that provides intelligent hints, explanations, and debugging support in real time.  
It allows users to ask contextual questions about coding problems while working together on solutions within the live collaboration editor.

---

#### **Core Responsibilities**

- Integrate **Google Gemini API** for contextual, AI-powered problem-solving assistance
- Process user queries using combined context: **problem description**, **current code**, and **user prompt**
- Provide **concise, well-formatted explanations** (limited to ~1500 characters for readability)
- Maintain a **floating chatbox UI** within the collaboration page for continuous interaction
- Display helpful statuses such as _“Please wait... Gemini is working”_ while responses are generated
- Gracefully handle downtime with a fallback message: _“⚠️ Gemini is unavailable right now”_

#### **Integration Details**

| Component                | File                                                   | Description                                  |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------- |
| **Backend Route**        | `collab-service/app/routes/ai-routes.js`               | Forwards chat prompts to Google Gemini API   |
| **Frontend Component**   | `frontend/collaboration/components/gemini-chatbot.tsx` | Floating chatbox that interacts with users   |
| **Service Layer**        | `frontend/services/chatbot/aiService.ts`               | Sends question, code, and prompt to backend  |
| **Environment Variable** | `.env`                                                 | Stores the Gemini API key for backend access |

---

#### **How It Works**

1. The user clicks the **Gemini logo button** in the collaboration editor.
2. The **floating AI Assistant chatbox** opens, showing previous message history.
3. When the user sends a query (e.g., _“Can you give me a hint?”_), the following happens:
   - Frontend sends a POST request to `/ai/chat` with:
     ```json
     {
       "question": "Validate Sudoku board",
       "code": "def isValidSudoku(board): ...",
       "prompt": "Can you give me a hint?"
     }
     ```
   - The backend (`ai-routes.js`) forwards this to:
     ```
     https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
     ```
   - Gemini processes the query and returns a concise, formatted response.
   - The response is displayed in the chatbox UI.
4. If the API call fails, the message _“⚠️ Gemini is unavailable right now”_ is shown instead.

---

#### **Example Response**

```json
{
  "reply": "You can use a Set to track duplicates in each row, column, and 3x3 sub-grid. Try iterating through the board and check if the number already exists before adding it."
}
```


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
- **React + Next.js** – frontend

### Database Layer

- **PostgreSQL** – database used
- **Supabase** – host PostgreSQL database

### Authentication & Security

- **JWT** (JSON Web Token) – for session handling and user authentication
- **Supabase Auth** – for signup, login, password reset, etc.

---

## Architecture Diagrams

![Architecture Diagram](./images/ArchitectureDiagram.png)

---

## Screenshots
![Matching Page](./images/MatchingPage.png)
![Question Page](./images/QuestionPage.png)
![Dark Mode](./images/DarkMode.png)

---

## Acknowledgements
- Questions used in this project are sourced from [LeetCode-Multiverse](https://github.com/RashadTanjim/LeetCode-Multiverse/tree/main).

