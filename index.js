const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();

// 💡 Apply CORS to all incoming requests, from your extension
app.use(cors({
  origin: 'chrome-extension://ecmpcigjalijfaenppbokbeknjcabmen',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

app.use(express.json());

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: question }],
        max_tokens: 300
      })
    });

    const data = await response.json();
    console.log("📤 Claude raw response:", JSON.stringify(data, null, 2));
    res.json({ answer: data?.content?.[0]?.text?.trim() || 'No response' });
  } catch (e) {
    console.error("❌ Claude error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Health check route
app.get("/", (req, res) => {
  res.send("Claude proxy is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
