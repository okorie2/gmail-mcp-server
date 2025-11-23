import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { z } from "zod";

export interface Tag {
  id: string;
  name: string;
  color: string;
  notesCount?: number;
}
const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  notesCount: z.number().optional(),
});
type UpdateNoteInput = {
  id: string;
  title?: string;
  content?: string;
  tags?: Array<{
    id?: string;
    name: string;
  }>;
};

// Response type from the API
interface UpdateNoteResponse {
  id: string;
  title: string;
  content: string;
  tags: Array<{
    id: string;
    name: string;
  }>;
  updatedAt: string;
}

// Create server instance
const server = new McpServer({
  name: "knowledge-base",
  version: "1.0.0",
});

server.tool(
  "add_note",
  "Add a note to the knowledge base",
  { title: z.string(), content: z.string(), tags: z.array(TagSchema) },
  async ({ title, content, tags }) => {
    try {
      const response = await axios.post("http://localhost:3000/api/notes", {
        title,
        content,
        tags,
      });

      return {
        content: [
          {
            type: "text",
            text: `Note created with ID: ${response.data.id}`,
          },
        ],
      };
    } catch (e) {
      console.error("Error creating note:", e);
      return {
        content: [
          {
            type: "text",
            text: `Error creating note: ${e}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "update_note",
  "Update an existing note in the knowledge base",
  {
    id: z.string().describe("The ID of the note to update"),
    title: z.string().optional().describe("New title for the note"),
    content: z.string().optional().describe("New content for the note"),
    tags: z.array(TagSchema).optional().describe("New tags for the note"),
  },
  async ({ id, title, content, tags }: UpdateNoteInput) => {
    try {
      // Create update object with only the fields that are provided
      const updateData: Partial<Omit<UpdateNoteInput, "id">> = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (tags !== undefined) updateData.tags = tags;

      await axios.put<UpdateNoteResponse>(
        `http://localhost:3000/api/notes/${id}`,
        updateData
      );

      return {
        content: [
          {
            type: "text",
            text: `Note with ID: ${id} updated successfully`,
          },
        ],
      };
    } catch (e) {
      console.error("Error updating note:", e);
      return {
        content: [
          {
            type: "text",
            text: `Error updating note: ${
              e instanceof Error ? e.message : String(e)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "find_note_id_by_keyword",
  "Find the ID of a note whose title or content matches the given keyword",
  {
    keyword: z
      .string()
      .describe("A keyword to search for in note titles or content"),
  },
  async ({ keyword }) => {
    try {
      const response = await axios.get("http://localhost:3000/api/notes");
      const notes = response.data;

      // Find the first note that includes the keyword in the title or content
      const matchingNote = notes.find(
        (note: any) =>
          note.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          note.content?.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log("Matching note:", matchingNote, keyword.toLowerCase());

      if (!matchingNote) {
        return {
          content: [
            {
              type: "text",
              text: `No note found containing the keyword: "${keyword}"`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Found note with ID: ${matchingNote.id}`,
          },
        ],
      };
    } catch (e) {
      console.error("Error searching notes:", e);
      return {
        content: [
          {
            type: "text",
            text: `Error searching notes: ${
              e instanceof Error ? e.message : String(e)
            }`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Knowldge base MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
