# gmail-mcp-server

A Node.js server for managing Gmail messages using the Gmail API. This project provides endpoints for fetching, processing, and organizing emails, designed to support the MCP (Mail Control Panel) application.

## Features

- Connects to Gmail via OAuth2
- Fetches and lists emails
- Processes and categorizes messages
- RESTful API endpoints
- Error handling and logging

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Google Cloud project with Gmail API enabled

### Installation

```bash
git clone https://github.com/yourusername/gmail-mcp-server.git
cd gmail-mcp-server
npm install
```

### Configuration

1. Create a `.env` file with your credentials:

   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=your-redirect-uri
   SESSION_SECRET=your-session-secret
   ```

2. Set up OAuth2 credentials in Google Cloud Console.

### Running the Server

```bash
npm start
```

## API Endpoints

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| GET    | /emails         | List emails            |
| POST   | /emails/process | Process and categorize |
| GET    | /status         | Server status          |

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

## License

MIT
