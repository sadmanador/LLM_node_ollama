// const pdf = require('pdf-parse');
// pdf(dataBuffer).then(function(data) {
//     console.log(data.text);
// });
//process.env.OPENAI_KEY
require("dotenv").config();

const pdf = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');


let dataBuffer = fs.readFileSync('sample.pdf');


async function getTextEmbeddings(text) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/embeddings',
            {
                model: 'text-embedding-ada-002',
                input: text,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.data[0].embedding;
    } catch (error) {
        console.error('Error getting text embeddings:', error.response ? error.response.data : error.message);
    }
}


async function chatWithOpenAI(embedding, query) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Using the document embedding: ${embedding}, ${query}` }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error during chat interaction:', error.response ? error.response.data : error.message);
    }
}


pdf(dataBuffer).then(async function(data) {
    console.log('PDF Text:', data.text);


    const embeddings = await getTextEmbeddings(data.text);
    console.log('Text Embeddings:', embeddings);


    const query = 'summarize the whole book in 5 sentences?';
    const chatbotResponse = await chatWithOpenAI(embeddings, query);
    console.log('Chatbot Response:', chatbotResponse);
});
