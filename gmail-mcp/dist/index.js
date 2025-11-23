import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { z } from "zod";
import { getAuthenticatedClient } from "./services/authentication.js";
const server = new McpServer({
    name: "gmail-server",
    version: "1.0.0",
});
server.registerTool("get_user_gmail_profile", {
    description: "Fetch the Gmail profile of the authenticated user",
    outputSchema: {
        emailAddress: z.string(),
        messagesTotal: z.number(),
        threadsTotal: z.number(),
        historyId: z.string(),
    },
}, async () => {
    try {
        const tokens = await getAuthenticatedClient();
        const response = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
            headers: {
                Authorization: `Bearer ${tokens.credentials.access_token}`,
            },
        });
        console.error("Gmail profile response:", response.data);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        emailAddress: response.data.emailAddress,
                        messagesTotal: response.data.messagesTotal,
                        threadsTotal: response.data.threadsTotal,
                        historyId: response.data.historyId,
                    }, null, 2),
                },
            ],
            structuredContent: response.data,
        };
    }
    catch (error) {
        console.error("Error fetching Gmail profile:", error);
        throw new Error("Failed to fetch Gmail profile");
    }
});
server.registerTool("send_gmail_message", {
    description: "Send an email using the authenticated user's Gmail account",
    inputSchema: {
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
        from: z.string().email().optional(),
    },
    outputSchema: { messageId: z.string() },
}, async (args) => {
    const tokens = await getAuthenticatedClient();
    // const message = `From:osyokorie@gmail.com\nTo:${args.to}\nSubject:${args.subject}\n\n${args.body}`;
    const message = [
        `From: osyokorie@gmail.com`,
        `To: ${args.to}`,
        `Subject: ${args.subject}`,
        "", // blank line before body
        args.body,
    ].join("\n");
    const encodedMessage = Buffer.from(message).toString("base64url");
    // const encodedMessage = btoa(message)
    //   .replace(/\+/g, "-")
    //   .replace(/\//g, "_")
    //   .replace(/=+$/, "");
    try {
        const response = await axios.post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
            raw: encodedMessage,
        }, {
            headers: {
                Authorization: `Bearer ${tokens.credentials.access_token}`,
                "Content-Type": "application/json",
            },
        });
        return {
            content: [
                {
                    type: "text",
                    text: `Email sent successfully with ID: ${response?.data?.id}`,
                },
            ],
            structuredContent: { messageId: response?.data?.id },
        };
    }
    catch (error) {
        console.error("Error sending Gmail message:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error sending email: ${error.message}`,
                },
            ],
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Gmail MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
