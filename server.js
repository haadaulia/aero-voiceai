require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// 1. Voice → polished text (powered by Groq)
app.post('/refine', async (req, res) => {
  const { transcript } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You turn messy, rambling spoken thoughts into a single polished professional email.
Keep it short — 2-3 sentences max.
Preserve the intent, urgency, and tone the person wants.
Output ONLY the email body, nothing else. No subject line, no sign-off, no explanation.`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        max_tokens: 200,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: 'Groq failed', details: err });
    }

    const data = await response.json();
    const refined = data.choices[0].message.content.trim();
    res.json({ refined });

  } catch (err) {
    res.status(500).json({ error: 'Groq request failed', details: err.message });
  }
});

// 2. TinyFish — stubbed for demo
app.post('/action', (req, res) => {
  res.json({ status: '✅ TinyFish: Email drafted!' });
});

// 3. Gradium voice confirmation — fully wired
app.post('/confirm', async (req, res) => {
  const { refined } = req.body;
  const apiKey = process.env.GRADIUM_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GRADIUM_API_KEY not set in .env' });
  }

  const confirmationText = refined
    ? `I've drafted a polite follow-up email. It says: ${refined}`
    : `I've drafted a polite but urgent follow-up email to John regarding the report.`;

  try {
    const response = await fetch('https://api.gradium.ai/api/post/speech/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        text: confirmationText,
        voice_id: 'YTpq7expH9539ERJ', // Emma — clear US English
        output_format: 'wav',
        only_audio: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: 'Gradium TTS failed', details: err });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/wav');
    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    res.status(500).json({ error: 'Gradium request failed', details: err.message });
  }
});

app.listen(3000, () => console.log('🎤 Aero: http://localhost:3000'));