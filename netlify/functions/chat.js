/*
* ====================================================================
* NETLIFY SERVERLESS FUNCTION (netlify/functions/chat.js)
* ====================================================================
* This is our new "pop-up" backend. It's not a server that's always running.
* Instead, it's a single function that Netlify will run every time our
* frontend sends a message.
*
* How it works:
* 1. The 'handler' is the main function that Netlify calls.
* 2. It receives the user's message from the 'event.body'.
* 3. It securely gets the API key from Netlify's environment variables.
* 4. It makes the exact same call to the OpenRouter API as before using axios.
* 5. It returns the AI's response in a specific format that Netlify understands.
*/

// We still need the 'axios' library to make API requests.
import axios from 'axios';

// This is the main function that Netlify will execute.
export const handler = async (event) => {
    // We only accept POST requests, which is how our frontend sends data.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the user's message from the body of the request.
        // The body comes in as a string, so we need to parse it as JSON.
        const { message } = JSON.parse(event.body);

        // A quick check to make sure the message isn't empty.
        if (!message) {
            return { statusCode: 400, body: 'Message is required.' };
        }

        // --- This is where we securely talk to the AI ---
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            // The data payload for the API
            {
                model: 'mistralai/mistral-7b-instruct:free', // Using the reliable Mistral model
                messages: [{ role: 'user', content: message }],
            },
            // The headers for the API request
            {
                headers: {
                    // We securely get the API key from Netlify's environment variables.
                    // This is set in the Netlify UI, NOT in the code.
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract the AI's reply from the response data.
        const aiResponse = response.data.choices[0].message.content;

        // Return a successful response to the frontend.
        // The body must be a JSON string.
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiResponse }),
        };

    } catch (error) {
        // If anything goes wrong, log the error and send a helpful message back.
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get response from AI.' }),
        };
    }
};