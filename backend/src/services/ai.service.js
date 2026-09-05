import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import * as zod from "zod";
import { searchInternet } from "./internet.service.js";
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});
const mistralModel = new ChatMistralAI({
  model: "voxtral-small-2507",
  apiKey: process.env.MISTRAL_API_KEY
})


const searchTool = tool(
  searchInternet, {
  name: "searchTool",
  description: "Search the internet for current, recent, or up-to-date information before answering.",
  schema: zod.object({
    query: zod.string().describe("The search query to look up on the internet.")
  })
}
);

const agent = createAgent({
  model: geminiModel,
  tools: [searchTool]
})

function needsFreshInformation(messages) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const currentYear = new Date().getFullYear().toString();

  // A year-specific sports result is just as time-sensitive as a question that
  // explicitly says "latest". Do not leave that decision entirely to the model.
  return /\b(latest|current|recent|today|now|news|score|result|winner|champion|final)\b/i.test(latestUserMessage)
    || new RegExp(`\\b${currentYear}\\b`).test(latestUserMessage);
}

function systemPrompt(webSearchResults) {
  const date = new Intl.DateTimeFormat("en-CA", { dateStyle: "long" }).format(new Date());
  return `You are a helpful and precise assistant. Today's date is ${date}.

For questions about current, recent, live, or year-specific information (including sports fixtures, finals, scores, winners, champions, elections, prices, and news), you MUST use current web-search evidence before answering. Never claim that an event has not happened, or that information is unavailable, until you have searched. Do not tell the user merely that you have access to search; use the evidence and answer their question directly. If the search results conflict or do not establish the answer, say that clearly.

${webSearchResults ? `Fresh web-search results for the user's question follow. Treat them as current evidence and answer from them:\n${webSearchResults}` : ""}`;
}

async function getFreshContext(messages) {
  if (!needsFreshInformation(messages)) return null;

  const question = [...messages].reverse().find((message) => message.role === "user")?.content;
  try {
    return await searchInternet({ query: question });
  } catch (error) {
    console.error("Web search failed:", error.message);
    return null;
  }
}

export async function generateResponse(messages) {
  const webSearchResults = await getFreshContext(messages);
  const response = await agent.invoke({
    messages: [new SystemMessage(systemPrompt(webSearchResults)), ...(messages.map(msg => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "ai") {
        return new AIMessage(msg.content);
      }
    }))]
  });
  return response.messages[response.messages.length - 1].text;
}

// Uses Gemini's native token stream through the LangChain agent.  The agent is
// intentionally kept here so tool calling continues to work exactly as it does
// for the non-streaming response path.
export async function* generateResponseStream(messages, signal) {
  const webSearchResults = await getFreshContext(messages);
  const stream = await agent.stream(
    {
      messages: [
        new SystemMessage(systemPrompt(webSearchResults)),
        ...messages.map((msg) =>
          msg.role === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content),
        ),
      ],
    },
    { streamMode: "messages", signal },
  );

  for await (const [chunk] of stream) {
    if (signal?.aborted) return;

    // Tool calls can also produce chunks. Only forward actual assistant text.
    if (chunk.getType?.() !== "ai") continue;
    const text = typeof chunk.content === "string" ? chunk.content : "";
    if (text) yield text;
  }
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
      You are a helpful assistant that generates concise and descriptive titles for chat conversation.
      User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. the title should be clear, relevant and engaging giving users a quick understanding of the chat's topic`),
    new HumanMessage(`
        Generate a title for a chat conversation based on the following first message : "${message}"`)
  ]);
  return response.text;
}
