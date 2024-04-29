import { createServer } from 'node:http';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';

const hostname = '127.0.0.1';
const port = 3000;

const outputParser = new StringOutputParser();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
  separators:[".","\n",]
});

// create the LLM
const llm = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "phi3",
});

const initLLM = async () => {
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
}

const createVectorStore = async () => {
  // reads the text file
  const loader = new TextLoader("./src/data/Baguio.txt");
  const docs = await loader.load();
  // splits the text file
  const splitDocs = await splitter.splitDocuments(docs);

  // stores the indexed file IN MEMORY. Will take a while.
  return await MemoryVectorStore.fromDocuments(
    splitDocs,
    new OllamaEmbeddings()
  );
}

const createChain = async (vectorStore) =>{
  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the question in less than 40 words. If you don't know the answer reply with "I don't know" and don't try to make up anything.
    Context: {context}
    Question: {input}
  `)

  const chain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  const retriever = vectorStore.asRetriever({
    k: 3 // no. of documents to return - default
  });
  
  return await createRetrievalChain({
    combineDocsChain: chain,
    retriever
  });
}

const chain = await createChain(await createVectorStore());

console.log('Where is near Baguio?')
const res = await chain.invoke({
  input: "What is near Baguio?"
})

console.log(res.answer)

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
