# Aero — Voice to Gmail

> Speak messy. Send perfect.

Aero is a voice-powered email assistant built for the **Voice AI Hack** (Voice & Productivity track). Speak your thoughts naturally — Aero refines them into a polished email and opens Gmail with everything pre-filled, ready to send in one click.

---

## How it works

1. **Speak** — tap the mic and say something like *"email john about the report, kinda urgent, don't be rude"*
2. **Silence detected** — after 5 seconds of silence (or a manual tap), recording stops automatically
3. **Groq synthesises** — your rambling is turned into a polished email body, subject line, and recipient name
4. **Gmail opens** — a new Gmail compose window appears with `To`, `Subject`, and `Body` pre-filled
5. **Gradium confirms** — a voice summary plays: *"Opening Gmail to John with the subject: Following up on the report. Your message is ready to send."*

---

## Tech stack

| Layer | Tech |
|-------|------|
| Speech-to-text | Web Speech API (browser-native, Chrome) |
| AI refinement | **Groq** — `llama-3.1-8b-instant` |
| Voice confirmation | **Gradium** TTS |
| Gmail integration | Gmail Compose URL API (`?view=cm&to=&su=&body=`) |
| Backend | Node.js + Express |

---

## Setup

### Prerequisites
- Node.js 18+
- Chrome browser (for Web Speech API)
- Groq API key → [console.groq.com](https://console.groq.com)
- Gradium API key → [gradium.ai](https://gradium.ai)

### Install & run

```bash
git clone <your-repo>
cd aero-voiceai
npm install
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_key_here
GRADIUM_API_KEY=your_gradium_key_here
```

Start the server:

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in **Chrome**.

---

## Demo script (for judges)

> *"Email Sarah — the client demo has been moved to Friday at 2pm, make sure she knows it's important."*

Aero will:
- Write: *"Hi Sarah, just a heads up that the client demo has been moved to Friday at 2pm. Please mark it as a priority in your calendar — it's an important one. See you then!"*
- Set subject: *"Client demo rescheduled to Friday 2pm"*
- Open Gmail with everything pre-filled
- Play: *"Opening Gmail to Sarah with the subject: Client demo rescheduled to Friday 2pm. Your message is ready to send."*

---

## API endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/refine` | POST | Sends transcript to Groq, returns `{refined, subject, to}` |
| `/confirm` | POST | Sends to Gradium TTS, returns WAV audio |

---

## Judging criteria alignment

| Criterion | How Aero addresses it |
|-----------|----------------------|
| **Innovation** | Voice → structured email → Gmail in one breath — no typing at any step |
| **Technical execution** | Groq structured JSON output, Gmail URL API, Gradium TTS chained seamlessly |
| **Voice AI integration** | Voice is the *only* input method; Gradium closes the loop with voice feedback |
| **Impact** | Solves real friction: anyone who's ever tried to type an email while driving or mid-thought |
| **Demo** | End-to-end in under 15 seconds, live on stage |

---

## Track

**Voice & Productivity** — sponsored by Gradium & TinyFish

Built at **Voice AI Hack**, London, April 2026.
