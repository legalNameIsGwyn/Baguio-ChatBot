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
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';

const hostname = '127.0.0.1';
const port = 3000;

const outputParser = new StringOutputParser();


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

// returns vectorStore of parsed local data
const loadData = async () =>{
  // reads the text file
  const loader = new TextLoader("./src/data/Baguio.txt");
  const docs = await loader.load();
  // splits the text file
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  // stores the indexed file. Will take a while.
  return await MemoryVectorStore.fromDocuments(
    splitDocs,
    new OllamaEmbeddings()
  );
}

const createChain = async (vectorStore) => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system",
    "Answer the user's question in no more than 40 words."],
    ["system", "{context}"],
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
  ])

  const chain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  const retriever = vectorStore.asRetriever({
    k: 3, // no. of references
  });

  const rephrasePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    ["user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation"],
  ])

  const histRetriver = await createHistoryAwareRetriever({
    llm,
    retriever,
    rephrasePrompt: rephrasePrompt,
  })

  return await createRetrievalChain({
    combineDocsChain: chain,
    retriever: histRetriver,
  })

}

const chain = await createChain(await loadData())


let chatHist = [
  new AIMessage("My name is Groot.")
]

const introMessage = "Introduce yourself as Groot, the chatbot for Baguio City."
let message = "Tell me about Baguio"

let res = await chain.invoke({
  input: introMessage,
  chat_history: chatHist,
})

chatHist.push(new HumanMessage(introMessage))

console.log(res.answer,"\n")
chatHist.push(new AIMessage(res.answer))
 
res = await chain.invoke({
  input: message,
  chat_history: chatHist,
})

console.log(res)

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
