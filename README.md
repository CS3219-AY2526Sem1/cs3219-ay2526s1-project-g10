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

**APIs (examples):**
- `POST /questions` - Create a new coding question (Admin only)
- `GET /questions` - Retrieve a list of all coding questions
- `GET /questions/random?difficulty={difficulty}&topic={topic}` - Fetch a random question based on difficulty and topic
- `GET /questions/{questionId}` - Retrieve details of a specific question
- `PUT /questions/{questionId}` - Update a specific coding question (Admin only)
- `DELETE /questions/{questionId}` - Delete a specific coding question (Admin only)
- `PATCH /questions/{questionId}` - Partially update a specific coding question (Admin only)

**Integration with user service:**
- The question service will interact with the user service to verify user identities and roles 
  when performing operations that require authentication or authorization.
- Requests to display data include JWT in the Authorization header for user verification.
- Backend for both services will validate the JWT to ensure secure communication.
- If validation is successful, question / attempts can be processed accordingly.

### Matching Service

### Collaboration Service

### Live Chat

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

### AI Assisted Problem-Solving and Chatbot

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

## Acknowledgements
- Questions used in this project are sourced from [LeetCode-Multiverse](https://github.com/RashadTanjim/LeetCode-Multiverse/tree/main).
