import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import verify from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chat', verify, async (req, res) => {
  try {
    const { prompt, problemContext, chatHistory } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key is not configured." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 🔥 NEW: Give the AI permanent context using systemInstruction
    const systemInstruction = `
      You are a helpful, encouraging expert programming tutor. 
      You are helping a student with the following programming problem:
      
      Title: ${problemContext.question}
      Description: ${problemContext.description}
      Available Solutions: ${JSON.stringify(problemContext.solutions || problemContext.solution)}
      
      Answer the user's questions clearly based on this problem. 
      Use markdown formatting to highlight code, bold important concepts, and create lists.
    `;

    // Initialize the model with the system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });

    // Format history for Gemini SDK
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Send the actual user message
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ message: "Failed to communicate with AI Tutor", error: error.message });
  }
});

export default router;