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
