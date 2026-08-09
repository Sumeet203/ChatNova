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
  model : "mistral-small-latest",
  apiKey : process.env.MISTRAL_API_KEY
})


const searchTool =  tool(
  searchInternet,{
    name : "searchTool",
    description : "Search the internet for current, recent, or up-to-date information before answering." ,
    schema : zod.object({
      query : zod.string().describe("The search query to look up on the internet.")
    })
  }
);

const agent = createAgent({
  model : geminiModel,
  tools : [searchTool]
})
export async function generateResponse(messages){
  const response = await agent.invoke({
    messages : [new SystemMessage("You are a helpful and precise assistant for answering questions. If you don't know the answer, just say so. For questions that require current, recent, latest, real-time, or internet-based information, call the searchTool tool first and answer based on the search result."),...(messages.map(msg =>{
    if(msg.role === "user"){
      return new HumanMessage(msg.content);
    }else if(msg.role === "ai"){
      return new AIMessage(msg.content);
    }
  }))]
  });
  return response.messages[response.messages.length-1].text;
}

// Uses Gemini's native token stream through the LangChain agent.  The agent is
// intentionally kept here so tool calling continues to work exactly as it does
// for the non-streaming response path.
export async function* generateResponseStream(messages, signal) {
  const stream = await agent.stream(
    {
      messages: [
        new SystemMessage("You are a helpful and precise assistant for answering questions. If you don't know the answer, just say so. For questions that require current, recent, latest, real-time, or internet-based information, call the searchTool tool first and answer based on the search result."),
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

export async function generateChatTitle(message){
  const response = await mistralModel.invoke([
    new SystemMessage(`
      You are a helpful assistant that generates concise and descriptive titles for chat conversation.
      User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. the title should be clear, relevant and engaging giving users a quick understanding of the chat's topic`),
      new HumanMessage(`
        Generate a title for a chat conversation based on the following first message : "${message}"`)
  ]);
  return response.text;
}
