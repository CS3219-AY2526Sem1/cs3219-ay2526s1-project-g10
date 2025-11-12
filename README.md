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

### Matching Service

### Collaboration Service

### Live Chat

### Question Attempt History

### Custom Matching Rooms

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
```
