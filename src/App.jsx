import "cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/"
);
const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});
const allSplits = await textSplitter.splitDocuments(docs);
// console.log(allSplits.length);

import { ChatOllama } from "@langchain/community/chat_models/ollama";

const ollamaLlm = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "phi3", // Default value
});

const response = await ollamaLlm.invoke(
  "Say \"I have been installed successfully!\" don't add anything else."
);
console.log(response.content);

function App() {


  return (
    <>
      <h1>ChatBot</h1>
    </>
  )
}

export default App
