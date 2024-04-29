import { createServer } from 'node:http';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { pull } from "langchain/hub";
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';

const hostname = '127.0.0.1';
const port = 3000;

const outputParser = new StringOutputParser();
const splitter = new RecursiveCharacterTextSplitter();

// create the LLM
const llm = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "phi3",
});

// prompt template
const initPrompt = ChatPromptTemplate.fromMessages([
  ["system", "Respond with a single sentence no longer than 10 words. Do not add anything else."],
  ["user", "{input}"],
]);

// includes template in the prompt
const initChain = initPrompt.pipe(llm).pipe(outputParser);

// calls the model
console.log('\nInstalled correctly?')
let response = await initChain.invoke({
  input: "Are you installed?",
});

console.log("LLM: ",response)
const prompt = ChatPromptTemplate.fromTemplate(`
  Answer the question in no more than 40 words
  Context: {context}
  Question: {input}
`)

const chain = await createStuffDocumentsChain({
  llm,
  prompt,
});

// reads the text file
const loader = new TextLoader("./src/data/Baguio.txt");
const docs = await loader.load();
// splits the text file
const splitDocs = await splitter.splitDocuments(docs);

const res = await chain.invoke({
  input: "What is Baguio?",
  context: splitDocs,
})

console.log(res)
// // indexes the file
// console.log('\nEmbedding and Vectorizing...')
// const embeddings = new OllamaEmbeddings();

// // stores the indexed file. Will take a while.
// const vectorStore = await MemoryVectorStore.fromDocuments(
//   splitDocs,
//   embeddings
// );
// console.log('Completed')

// const retriever = vectorStore.asRetriever();
// prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");



// // let res = await chain.invoke({
// //   input: 'What is Baguio?'
// // })

// console.log(res)

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
