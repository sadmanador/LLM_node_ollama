// const pdf = require('pdf-parse');
// pdf(dataBuffer).then(function(data) {
//     console.log(data.text);
// });
//
require("dotenv").config();
const pdf = require('pdf-parse');
const fs = require('fs');
const { OpenAI } = require('langchain/openai');
const { Embeddings } = require('langchain/embeddings');
const { Chat } = require('langchain/chat');


let dataBuffer = fs.readFileSync('sample.pdf');


const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});


async function getTextEmbeddings(text) {
    const embeddings = new Embeddings({
        model: 'text-embedding-ada-002',  // OpenAI's text embedding model
    });
    return await embeddings.embed(text);
}


async function chatWithOpenAI(text) {
    const chat = new Chat({
        model: 'gpt-3.5-turbo', 
        openai: openai,
    });

    const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: text }
    ];

    const response = await chat.generate(messages);
    return response.choices[0].message.content;
}


pdf(dataBuffer).then(async function(data) {
    console.log("PDF Text:", data.text);


    const embeddings = await getTextEmbeddings(data.text);
    console.log("Text Embeddings:", embeddings);


    const query = "What is the main topic of this document?";
    const chatbotResponse = await chatWithOpenAI(query);
    console.log("Chatbot Response:", chatbotResponse);
});

