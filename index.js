const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const app = express();

// ✅ Apply CORS for your Chrome extension
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
        model: "claude-3-7-sonnet-20250219",
        messages: [{ role: 'user', content: question }],
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ Claude API error:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    console.log("📤 Claude raw response:", JSON.stringify(data, null, 2));
    res.json({ answer: data?.content?.[0]?.text?.trim() || 'No response' });
  } catch (e) {
    console.error("❌ Fetch error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Claude proxy is running.");
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
