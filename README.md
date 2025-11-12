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
Users can create or join custom rooms to collaborate with friends.

**Custom Room Creation:**
1. User navigates to the matching page.
2. User clicks `Create/Join Custom Room` button.
3. User clicks `Create Room` button.
4. User selects difficulty and topic of choice, then sets a room password.
5. User clicks `Create Room` button.
6. Room code is displayed to the user.
7. User is redirected to the collaboration page.

**Joining a Custom Room:**
1. User navigates to the matching page.
2. User clicks `Create/Join Custom Room` button.
3. User clicks `Join Room` button.
4. User enters room code and password.
5. User clicks `Join Room` button.
6. User is redirected to the collaboration page.

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

![Matching Page](./images/MatchingPage.png)
![Question Page](./images/QuestionPage.png)
![Dark Mode](./images/DarkMode.png)

---