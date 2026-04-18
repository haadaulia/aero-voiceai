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
            content: `You are an expert email writer. Your job is to turn messy, rambling spoken thoughts into a short, polished, professional email body.

Rules:
- Extract and USE any names mentioned (e.g. "email john" → address it to John)
- Extract and USE any specific topics, documents, deadlines, or context mentioned
- Match the urgency — if they say urgent/ASAP/today, make the email clearly urgent but still polite
- Match the tone — if they say "don't be rude" or "be nice", keep it warm and professional
- Keep it SHORT — 2-3 sentences max
- Output ONLY the email body. No subject line. No "Hi," greeting on its own line. No sign-off. No explanation. Just the message itself.
- Start directly with "Hi [name]," if a name was mentioned, otherwise "Hi there,"

Examples:
Input: "uh email john... still waiting on that report... kinda urgent... don't sound rude"
Output: Hi John, just following up on the report — would you be able to share it today? It would really help us stay on track, thanks so much.

Input: "need to tell sarah the meeting is moved to thursday at 3pm"
Output: Hi Sarah, just a quick heads up that the meeting has been moved to Thursday at 3pm. See you then!

Input: "message the team that the deadline is pushed to next friday because of the client feedback"
Output: Hi team, wanted to let you know the deadline has been pushed to next Friday due to client feedback. More details to follow — thanks for your patience.`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        max_tokens: 200,
        temperature: 0.4,
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
    ? `I've drafted your email. It says: ${refined}`
    : `I've drafted a polite but urgent follow-up email.`;

  try {
    const response = await fetch('https://api.gradium.ai/api/post/speech/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        text: confirmationText,
        voice_id: 'YTpq7expH9539ERJ',
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