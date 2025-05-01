require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: 'Missing question' });

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
    res.json({ answer: data?.content?.[0]?.text || 'No response' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
