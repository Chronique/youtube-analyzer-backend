require('dotenv').config();
require('dotenv').config();
console.log('API Key loaded:', process.env.SUPADATA_API_KEY ? 'YES - ' + process.env.SUPADATA_API_KEY.slice(0, 8) + '...' : 'NO - EMPTY');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/transcript/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const { lang = 'id' } = req.query;

  try {
    let response = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&lang=${lang}`,
      {
        headers: {
          'x-api-key': process.env.SUPADATA_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Fallback ke English kalau bahasa Indonesia tidak ada
    if (!response.ok && lang === 'id') {
      response = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&lang=en`,
        {
          headers: {
            'x-api-key': process.env.SUPADATA_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message || 'Transcript tidak tersedia' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));