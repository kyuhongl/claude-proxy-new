require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors({
  origin: '*', // or replace with your extension ID if you want to restrict
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    console.log("❌ No question received");
    return res.status(400).json({ error: 'Missing question' });
  }

  console.log("📥 Sending to Claude:", question.slice(0, 100));

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
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

    const data = await claudeRes.json();

    // Log everything you got from Claude
    console.log("📤 Claude raw response:", JSON.stringify(data, null, 2));

    if (data?.content?.[0]?.text) {
      res.json({ answer: data.content[0].text.trim() });
    } else {
      res.json({ answer: "⚠️ Claude returned no usable content", raw: data });
    }
  } catch (e) {
    console.error("❌ Claude API error:", e.message);
    res.status(500).json({ error: e.message });
  }
});


app.get("/", (req, res) => {
  res.send("Claude proxy is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
