import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let conversationHistory: any[] = [];

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    const lowerQuery = query.toLowerCase();

    const isFollowUp =
      lowerQuery.includes("explain") ||
      lowerQuery.includes("simplify") ||
      lowerQuery.includes("simple") ||
      lowerQuery.includes("short") ||
      lowerQuery.includes("elaborate") ||
      lowerQuery.includes("more") ||
      lowerQuery.includes("example");

    let results: any[] = [];
    let userMessage = query;

    if (!isFollowUp) {
      const tavilyResponse = await axios.post("https://api.tavily.com/search", {
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
      });

      results = tavilyResponse.data.results || [];

      const context = results
        .map(
          (item: any, index: number) =>
            `[${index + 1}] ${item.title}\n${item.content}\nURL: ${item.url}`
        )
        .join("\n\n");

      userMessage = `Question: ${query}\n\nSources:\n${context}`;
    }

    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a research assistant. For new questions, answer using the provided sources and cite them like [1], [2]. For follow-up questions such as 'explain it simply', use the earlier conversation context and answer naturally.",
        },
        ...conversationHistory,
      ],
    });

    const answer =
      completion.choices[0]?.message?.content || "No answer generated.";

    conversationHistory.push({
      role: "assistant",
      content: answer,
    });

    return res.json({
      answer,
      sources: results.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title,
        url: item.url,
        content: item.content,
      })),
    });
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    console.error("STATUS:", error?.response?.status);
    console.error("DATA:", error?.response?.data);

    return res.status(500).json({
      error: "Something went wrong",
      details: error?.response?.data || error?.message || "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});