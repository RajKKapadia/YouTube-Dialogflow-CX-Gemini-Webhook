const express = require('express');

const router = express.Router();

const { generateResponse } = require('./geminiApi');

const formatResponseForDialogflow = (message, sessionInfo) => {
    let responseData = {
        fulfillmentResponse: {
            messages: [
                {
                    text: {
                        text: [message],
                        redactedText: [message]
                    },
                    responseType: 'HANDLER_PROMPT',
                    source: 'VIRTUAL_AGENT'
                }
            ],
            mergeBehavior: 'MERGE_BEHAVIOR_UNSPECIFIED'
        }
    };
    if (sessionInfo !== '') {
        responseData['sessionInfo'] = sessionInfo;
    }
    return responseData;
};

router.post('/webhook', async (req, res) => {
    const tag = req.body.fulfillmentInfo.tag;
    const query = req.body.text;
    let sessionInfo = req.body.sessionInfo;
    let responseData = {};
    if (tag === 'askGemini') {
        let parameters = {};
        if (req.body.sessionInfo.hasOwnProperty('parameters')) {
            parameters = req.body.sessionInfo.parameters;
        } else {
            parameters = {
                chatHistory: []
            }
        }
        const geminiResponse = await generateResponse(query, parameters.chatHistory);
        parameters.chatHistory.push(
            {
                role: 'user',
                parts: [query]
            }
        );
        parameters.chatHistory.push(
            {
                role: 'model',
                parts: [geminiResponse.response]
            }
        );
        sessionInfo['parameters'] = parameters;
        responseData = formatResponseForDialogflow(geminiResponse.response, sessionInfo);
    } else {
        responseData = formatResponseForDialogflow(`No handler for the tag -> ${tag}.`, '');
    }
    res.send(responseData);
});

module.exports = {
    router
};
