import { createServer } from 'node:http';

const hostname = '127.0.0.1';
const port = 3000;

import { ChatOllama } from "@langchain/community/chat_models/ollama";

const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "phi3",
});

import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Respond with a single sentence no longer than 20 words. Do not add anything else."],
  ["user", "{input}"],
]);

const chain = prompt.pipe(chatModel);

let response = await chain.invoke({
  input: "what is LangSmith?",
});

console.log("First Message: ",response.content)


import { StringOutputParser } from "@langchain/core/output_parsers";

const outputParser = new StringOutputParser();

const llmChain = prompt.pipe(chatModel).pipe(outputParser);

response = await llmChain.invoke({
  input: "what is LangSmith?",
});

console.log("Second message: ", response)

import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("./src/data/Baguio.txt");

const docs = await loader.load();

console.log(docs)




const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
