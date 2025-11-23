# Knowledge Base MCP Server

This project implements a Model Context Protocol (MCP) server that provides tools for managing a knowledge base through API interactions. It allows AI assistants to create, update, and search notes in your knowledge base.

## Overview

The Knowledge Base MCP Server provides the following functionality:

- Add new notes with titles, content, and tags
- Update existing notes
- Find note IDs by searching for keywords in titles or content

This server acts as a bridge between AI assistants and your knowledge base API, enabling structured interaction with your notes database.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn
- A running API server at `http://localhost:3000` that provides note management functionality

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

## Dependencies

This project relies on the following packages:

- `@modelcontextprotocol/sdk` - The Model Context Protocol SDK
- `axios` - For making HTTP requests to the knowledge base API
- `zod` - For schema validation

## Building the Server

Build the server with

```bash
npm run build
```

## Running the Server

Start the server with:

```bash
node index.js
```

The server will run on stdio, allowing it to communicate with clients that implement the MCP client protocol.

Testing Your Server
To test your MCP server with Claude for Desktop:

Follow the guide from Anthropic at: [Testing Your Server with Claude for Desktop](https://modelcontextprotocol.io/quickstart/server#testing-your-server-with-claude-for-desktop-2)

This guide will walk you through the process of connecting your MCP server to Claude and verifying that the tools are working correctly.

## Available Tools

### 1. add_note

Creates a new note in the knowledge base.

**Parameters:**

- `title` (string): Title of the note
- `content` (string): Content of the note
- `tags` (array): Array of tag objects with `id`, `name`, and `color` properties

### 2. update_note

Updates an existing note in the knowledge base.

**Parameters:**

- `id` (string): The ID of the note to update
- `title` (string, optional): New title for the note
- `content` (string, optional): New content for the note
- `tags` (array, optional): New tags for the note

### 3. find_note_id_by_keyword

Searches for notes containing a specific keyword in their title or content.

**Parameters:**

- `keyword` (string): A keyword to search for in note titles or content

## API Integration

This server expects a knowledge base API running at `http://localhost:3000` with the following endpoints:

- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update an existing note
- `GET /api/notes` - Get all notes

## Note Structure

A note in the knowledge base has the following structure:

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
    notesCount?: number;
  }>;
  updatedAt: string;
}
```

## Error Handling

The server includes error handling for API requests. If an error occurs, it will be logged to the console and returned in the tool response.

## License

[Your License Here]

## Contributing

[Your Contribution Guidelines Here]
