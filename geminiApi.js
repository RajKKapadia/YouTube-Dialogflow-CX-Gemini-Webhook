const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require('./constant');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generateResponse = async (query, chatHistory) => {
    try {
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(query);
        const response = result.response;
        const text = response.text();
        return {
            status: 1,
            response: text
        };
    } catch (error) {
        return {
            status: 0,
            response: ''
        };
    }
};

module.exports = {
    generateResponse
};
