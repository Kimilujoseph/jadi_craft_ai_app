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

## Marketplace Feature

The application includes a marketplace where vendors can promote their websites for artifacts and cultural items. When a user's query matches a listing's category, the AI will naturally weave promoted links into its response, driving traffic to the vendor's site.

### How to Become a Vendor

To create marketplace listings, a user's `role` must be set to `VENDOR`. The `User` model in the database has a `role` enum with three possible values: `USER`, `ADMIN`, and `VENDOR`.

For new sign-ups, you can modify the user's role directly in the database after they have created an account.

### Creating a Marketplace Listing

Once a user has the `VENDOR` role, they can create listings by sending a `POST` request to the following endpoint.

- **Endpoint**: `POST /api/v1/marketplace/listings`
- **Authentication**: Requires a valid JWT token for a `VENDOR` user.

**Request Body:**

The request body must be a JSON object with the following fields:

| Field         | Type              | Required | Description                                             |
|---------------|-------------------|----------|---------------------------------------------------------|
| `url`         | `String`          | Yes      | The full URL of the website to promote.                 |
| `title`       | `String`          | Yes      | A short, descriptive title for the listing.             |
| `description` | `String`          | Yes      | A longer description of the website or products.        |
| `categories`  | `Array<String>`   | Yes      | An array of relevant categories (e.g., "ART", "POTTERY"). |
| `keywords`    | `Array<String>`   | No       | An optional array of keywords for more specific targeting. |

**Example `curl` Request:**

```bash
curl -X POST http://localhost:3001/api/v1/marketplace/listings \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
  "url": "https://www.my-artifact-shop.com",
  "title": "My Awesome Artifacts",
  "description": "Authentic, handmade pottery and beadwork from local artisans.",
  "categories": ["POTTERY", "HANDMADE", "ART"],
  "keywords": ["beads", "vases", "sculptures"]
}'
```

## Chat Conversation Logic

When a user starts a new conversation, the content of their very first message is automatically used to create the title for that chat session. This helps identify and organize different conversations in the database.


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
