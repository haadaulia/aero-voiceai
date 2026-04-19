require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Your existing POST routes (unchanged)
app.post('/refine', async (req, res) => { /* your code */ });
app.post('/action', (req, res) => { /* your code */ });
app.post('/confirm', async (req, res) => { /* your code */ });

// Export for Vercel serverless
module.exports = app;