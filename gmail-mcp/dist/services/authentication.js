import { google } from "googleapis";
import open from "open";
import http from "http";
import url, { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const TOKEN_PATH = path.join(process.cwd(), "google_tokens.json");
const SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
];
export async function getAuthenticatedClient() {
    if (fs.existsSync(TOKEN_PATH)) {
        try {
            const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
            const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
            oauth2Client.setCredentials(tokens);
            // return oauth2Client;
        }
        catch (error) {
            console.error("Error reading or parsing token file:", error);
        }
        // return oauth2Client;
    }
    const PORT = 53124 + Math.floor(Math.random() * 1000);
    const REDIRECT_URI = `http://localhost:${PORT}`;
    if (!REDIRECT_URI || CLIENT_ID === undefined || CLIENT_SECRET === undefined) {
        throw new Error("REDIRECT_URI is not defined in environment variables");
    }
    console.error("Using redirect URI:", REDIRECT_URI);
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent", // ensures refresh_token is returned
    });
    await open(authUrl);
    const server = http.createServer(async (req, res) => {
        const reqUrl = req.url ?? "";
        if (reqUrl.includes("/?code=")) {
            const qs = new url.URL(reqUrl, `http://localhost:${PORT}`).searchParams;
            const code = qs.get("code");
            try {
                const { tokens } = await oauth2Client.getToken(code);
                oauth2Client.setCredentials(tokens);
                // fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                res.end("<h2>Authentication successful! You can close this tab.</h2>");
                return tokens;
            }
            catch (err) {
                console.error("Error retrieving access token:", err);
                res.end(`<h2> Authentication failed. Check console for details. ${err.message}</h2>`);
            }
            finally {
                server.close();
            }
        }
        else {
            res.end("<h2>Waiting for Google OAuth response...</h2>");
            console.error("Invalid request received:", reqUrl);
        }
    });
    await new Promise((resolve) => server.listen(PORT, () => resolve("listening")));
    // Return a Promise that resolves once tokens are stored
    return new Promise((resolve) => {
        server.on("close", () => resolve(oauth2Client));
    });
}
const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    const token = await getAuthenticatedClient();
    console.log("Obtained tokens:", token.credentials.access_token);
}
