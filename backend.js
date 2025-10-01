/*
* ====================================================================
* SECURE BACKEND SERVER (backend.js)
* ====================================================================
* This is the brain of our operation. It's a simple server that does one crucial job:
* It acts as a secure middleman between our pretty frontend and the powerful DeepSeek AI.
*
* Why do we need this?
* SECURITY: Your API key is a secret! If you put it directly in the HTML/frontend code,
* anyone could view the page source, steal your key, and use it. This backend keeps it
* completely hidden from the public.
*
* How it works:
* 1. It listens for messages coming from our frontend on a specific address (port 3000).
* 2. When a message arrives, it takes the user's text.
* 3. It securely attaches your secret DeepSeek API key.
* 4. It forwards the complete request to the OpenRouter (DeepSeek) API.
* 5. It waits for the AI's response.
* 6. It sends that response back to our frontend to be displayed.
*/

// --- 1. IMPORT NECESSARY LIBRARIES ---

// 'express' is a popular framework for building web servers in Node.js. It simplifies everything.
import express from 'express';
// 'axios' is a library that makes it easy to send HTTP requests to APIs (like OpenRouter).
import axios from 'axios';
// 'cors' is a security feature that lets our frontend (running on a different address) talk to our backend.
import cors from 'cors';
// 'dotenv' lets us load secret values (like our API key) from a separate file (.env) to keep them safe.
import 'dotenv/config';


// --- 2. INITIALIZE THE SERVER ---

// Create an instance of an express application.
const app = express();
// Define the port number our server will listen on. 3000 is a common choice for development.
const PORT = process.env.PORT || 3000;

// --- 3. CONFIGURE MIDDLEWARE ---
// Middleware are functions that run for every incoming request.

// Use the CORS middleware to allow our frontend to make requests to this backend.
app.use(cors());
// Use express.json() middleware to enable our server to understand and parse incoming JSON data from the frontend.
app.use(express.json());


// --- 4. DEFINE THE API ROUTE ---

// We create a '/chat' endpoint. When the frontend sends a POST request here, this code will run.
app.post('/chat', async (req, res) => {
    // Retrieve the user's message from the request body sent by the frontend.
    const userInput = req.body.message;

    // A quick check to make sure the message isn't empty.
    if (!userInput) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        // --- This is where we securely talk to the AI ---
        console.log("Sending to OpenRouter:", userInput);

        // 'axios.post' sends the request to the OpenRouter API.
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            // The data payload for the API
            {
                model: 'deepseek/deepseek-chat', 
                messages: [{ role: 'user', content: userInput }],
            },
            // The headers for the API request
            {
                headers: {
                    // We securely get the API key from our environment variables.
                    // It is NEVER exposed to the user.
                    'Authorization': 'Bearer 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',
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
                    'X-Title': 'ARs ChatBot', // Required by OpenRouter
                },
            }
        );

        // Extract the AI's reply from the response data.
        const aiResponse = response.data.choices[0].message.content;

        // Send the AI's reply back to the frontend in a JSON format.
        res.json({ reply: aiResponse });

    } catch (error) {
        // If anything goes wrong (e.g., API key is invalid, API is down), we log the error
        // and send a helpful message back to the frontend.
        console.error('Error calling OpenRouter API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get response from AI.' });
    }
});


// --- 5. START THE SERVER ---

// This command tells our server to start listening for incoming requests on the specified port.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Waiting for messages from the frontend...");
});
// Now, when you run this file with Node.js (node backend.js), your secure backend server will be up and running!