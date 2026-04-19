export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, to } = req.body;
  const apiKey = process.env.GRADIUM_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GRADIUM_API_KEY not configured' });
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
    res.setHeader('Content-Type', 'audio/wav');
    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    res.status(500).json({ error: 'Gradium request failed', details: err.message });
  }
}
