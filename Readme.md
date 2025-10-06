# Jadi Craft Cultural Learning App

This project is the backend service for the Jadi Craft Cultural Learning App, a web-based application designed to provide User with structured, meaningful cultural knowledge through an interactive AI-powered chat interface.

## Overview

The application allows User to ask questions about various cultural domains (e.g., traditions, history, practices) and receive formatted text responses. It includes an optional Text-to-Speech (TTS) feature for audio narration, enhancing accessibility. The backend is built with Node.js and Express, and it leverages Prisma as an ORM for database interactions.

## Features

- **AI-Powered Responses:** Integrates with Large Language Models (LLMs) to provide answers to user queries.
- **Prompt Orchestration:** A central orchestrator manages the flow of requests, from categorization to LLM invocation and response generation.
- **Fallback Support:** Automatically switches to a fallback LLM provider if the primary service fails or times out.
- **Text-to-Speech (TTS):** Optional audio narration of AI-generated answers.
- **Robust API:** Includes critical production-ready features:
  - **Rate Limiting:** Limits the number of requests a user can make per day to prevent abuse and manage costs.
  - **Idempotency:** Ensures that duplicate client requests do not result in duplicate actions.
  - **Timeouts:** Prevents requests from hanging due to slow AI model responses.
  - **Centralized Error Handling:** A standardized system for handling all application errors.
- **Detailed Logging:** All requests, responses, and errors are logged to the database for analytics and debugging.

## Architecture

The backend follows a service-oriented architecture, orchestrated by a central controller.

- **`Express`**: Serves as the web server and API framework.
- **`Prisma`**: Manages database connections, migrations, and queries.
- **Services & Components**:
  - **`PromptOrchestrator`**: The core component that manages the entire request lifecycle.
  - **`Categorizer`**: Classifies user queries into predefined categories to refine prompts.
  - **`TemplateEngine`**: Builds the final LLM prompt based on the category and user query.
  - **`LLMProvider`**: An abstraction for interacting with primary and fallback LLMs.
  - **`TTSService`**: An abstraction for handling Text-to-Speech conversion.

## API Endpoint

## POST /api/v1/auth/signin  and #POST /api/v1/auth/signup


**Request Body**

```json

{
   "email":"someone@gmail.com",
   "password":"minimum of 8",
}

```

### POST /api/v1/ask

This is the main endpoint for asking questions.

**Request Body:**
```json
{
  "question": "What are the traditional marriage customs in the Luo community?",
  "wantsAudio": true,
  "userId": 123,
  "idempotencyKey": "a-unique-uuid-generated-by-client"
}
```

**Success Response (200 OK):**
```json
{
  "text": "The traditional marriage customs of the Luo community involve...",
  "audioUrl": "https://example.com/audio.mp3",
  "fallbackUsed": false,
  "error": null
}
```

**Error Response (e.g., 429 Too Many Requests):**
```json
{
  "success": false,
  "error": "You have exceeded the daily request limit."
}
```

## Project Setup

Follow these steps to get the backend server running locally.

**1. Prerequisites:**
   - [Node.js](https://nodejs.org/) (v18 or later recommended)
   - [NPM](https://www.npmjs.com/)
   - A running [MySQL](https://www.mysql.com/) database server.

**2. Clone the Repository:**
   ```bash
   git clone <your-repository-url>
   cd <repository-name>
   ```

**3. Install Dependencies:**
   ```bash
   npm install
   ```

**4. Set Up Environment Variables:**
   Create a file named `.env` in the root of the project and add the following variables. Replace the values with your local database configuration.

   ```env
   # The connection string for your MySQL database
   DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/JADI_AI_APP"

   # The port the server will run on
   PORT=3001
   ```

**5. Run Database Migrations:**
   This command will set up the database schema based on the Prisma model.
   ```bash
   npx prisma migrate dev
   ```
   *Note: If you encounter any database sync issues during development, you can reset the database with `npx prisma migrate reset`. **This will delete all data.** *

**6. Run the Server:**
   This will start the server with `nodemon`, which automatically restarts on file changes.
   ```bash
   npm run dev
   ```
   The server should now be running and listening on the port specified in your `.env` file (e.g., http://localhost:3001).

## Directory Structure

```
.
├── prisma/             # Contains the Prisma schema and migration files
├── src/                # Main source code for the application
│   ├── api/            # API route definitions (Express routers)
│   ├── categorizer/    # Logic for query categorization
│   ├── database/       # Prisma client configuration
│   ├── llmProvider/    # Logic for interacting with LLMs
│   ├── middleware/     # Custom Express middleware (error handling, rate limiting)
│   ├── models/         # Data structure classes (e.g., Response)
│   ├── promptOrchestrator/ # The core orchestration logic
│   ├── templateEngine/ # Logic for building prompts
│   ├── ttsService/     # Logic for Text-to-Speech
│   ├── utils/          # Shared utility functions and classes
│   ├── express-app.js  # Express app configuration
│   └── index.js        # The main entry point for the application
├── .env                # Environment variables (not committed to git)
├── package.json        # Project dependencies and scripts
└── Readme.md           # This file
```
