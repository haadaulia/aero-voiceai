# Aero — Voice to Action

Speak messy. Send perfect. Powered by Groq + Gradium TTS.

## Deploy to Vercel

### 1. Install Vercel CLI (optional, or use the dashboard)
```bash
npm i -g vercel
```

### 2. Deploy
```bash
cd aero-voiceai
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and import the project.

### 3. Set Environment Variables

In the Vercel dashboard → Project → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | your Groq API key |
| `GRADIUM_API_KEY` | your Gradium API key |

That's it — no build step, no Express server needed.

## Project Structure

```
aero-voiceai/
├── api/
│   ├── refine.js      ← POST /refine  (Groq LLM)
│   └── confirm.js     ← POST /confirm (Gradium TTS)
├── public/
│   ├── index.html
│   └── style.css
├── vercel.json        ← routing config
└── package.json
```

## Local Development

```bash
npx vercel dev
```
