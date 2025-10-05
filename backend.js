/*
* ====================================================================
* LOCAL EXPRESS.JS BACKEND SERVER (backend.js)
* ====================================================================
* This file replaces the Netlify function for local testing.
* It creates a simple, continuously running server on your machine.
*
* Key Changes from Netlify Function:
* - Uses Express.js to create a server and define routes.
* - Uses 'dotenv' to load API keys from a .env file securely.
* - Uses 'cors' to allow the frontend (on a different port) to talk to this server.
* - The main logic is inside an 'app.post()' route handler instead of 'exports.handler'.
*/

// 1. Import necessary libraries
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // This loads variables from your .env file

// 2. Initialize the Express app
const app = express();
const PORT = 3000; // The port your server will run on

// 3. Setup Middleware
app.use(cors()); // Enable CORS to allow your frontend to make requests
app.use(express.json()); // Allow the server to understand JSON data from requests

// 4. Define the Chat Endpoint
app.post('/chat', async (req, res) => {
    try {
        // Get the user's message from the request body
        const { message } = req.body;

        // Check for a valid message
        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        // --- This is the same secure call to the AI as in your Netlify function ---
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'deepseek/deepseek-r1:free',
                messages: [{ role: 'user', content: message }],
            },
            {
                headers: {
                    // Get the API key from environment variables
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract the AI's reply
        const aiResponse = response.data.choices[0].message.content;

        // Send the reply back to the frontend
        res.status(200).json({ reply: aiResponse });

    } catch (error) {
        // Handle any errors
        console.error('Error in /chat endpoint:', error.message);
        res.status(500).json({ error: 'Failed to get response from AI.' });
    }
});

// 5. Start the server
app.listen(PORT, () => {
    console.log(`Server is running successfully on http://localhost:${PORT}`);
});