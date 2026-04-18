require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// 1. Voice → structured email JSON (Groq)
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
            content: 'You are an expert email writer. Turn messy spoken thoughts into a polished email.\n\nReturn ONLY a raw JSON object (no markdown, no backticks, no extra text) with exactly these fields:\n{"to":"recipient name or empty string","subject":"concise subject line","body":"2-3 sentence email body"}\n\nRules for body:\n- Start with "Hi [name]," if a name was mentioned, otherwise "Hi there,"\n- Match urgency (urgent/ASAP → clearly urgent but polite)\n- Match tone (dont be rude → warm and professional)\n- Keep it SHORT — 2-3 sentences max. No sign-off, no signature.\n\nRules for subject: 4-6 words summarising the email purpose.\nRules for to: first name only if mentioned, empty string if not.\n\nExamples:\nInput: "uh email john... still waiting on that report... kinda urgent"\nOutput: {"to":"john","subject":"Following up on the report","body":"Hi John, just following up on the report — would you be able to share it today? It would really help us stay on track, thanks so much."}\n\nInput: "need to tell sarah the meeting is moved to thursday at 3pm"\nOutput: {"to":"sarah","subject":"Meeting rescheduled to Thursday 3pm","body":"Hi Sarah, just a quick heads up that the meeting has been moved to Thursday at 3pm. See you then!"}'
          },
          { role: 'user', content: transcript },
        ],
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: 'Groq failed', details: err });
    }

    const data = await response.json();
    const raw = data.choices[0].message.content.trim();

    let parsed;
    try {
      const clean = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { to: '', subject: 'New message', body: raw };
    }

    res.json({
      refined: parsed.body || raw,
      subject: parsed.subject || 'New message',
      to: parsed.to || '',
    });

  } catch (err) {
    res.status(500).json({ error: 'Groq request failed', details: err.message });
  }
});

// 2. Gradium voice summary — reads back a short summary (not the full email)
app.post('/confirm', async (req, res) => {
  const { subject, to } = req.body;
  const apiKey = process.env.GRADIUM_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GRADIUM_API_KEY not set in .env' });
  }

  let summary;
  if (to && subject) {
    summary = `Opening Gmail to ${to} with the subject: ${subject}. Your message is ready to send.`;
  } else if (subject) {
    summary = `Opening Gmail with the subject: ${subject}. Your message is ready to send.`;
  } else {
    summary = 'Your email is ready. Opening Gmail now.';
  }

  try {
    const response = await fetch('https://api.gradium.ai/api/post/speech/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        text: summary,
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
