# Baguio Environment ChatBot
This chatbot uses a local instance of ollama/langchain answer questions about Baguio City's environment based on data gathered by [Insert Group Members]. Its main purpose is to satisfy the requirements of the groups NLP subject.

# Setup Guide
This setup guide is intended for those who wish to try the project.

1. Clone the repo.
2. Make sure to have [npm](https://www.npmjs.com/)installed and [Docker](https://www.docker.com/) running. 
3. Run the command below in CMD. 
```
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```
4. Run the command below to install and run the phi3.
```
docker exec -it ollama ollama run phi3
```
5. Navigate to the cloned repo through CMD.
6. Run the command below to install required node modules.
```
npm install
```
7. Run the command below to start the LLM server. Wait for the final message *` LLM Running. `* before proceeding to the next step.
```
npm run nodemon
```
8. Run the command below in the same repo to start the vite server.
```
npm run dev
```
9. Hold down 'ctrl' and click on the Local link.
10. You should see the message *`I have been installed successfully!`* in the console of the browser.