import { ChatOllama } from "@langchain/community/chat_models/ollama";

const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "phi3",
});

await chatModel.invoke("what is LangSmith?");