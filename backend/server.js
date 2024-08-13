const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const port = 3001;

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

app.get('/', (req, res) => {
  res.send('SwiftScribe backend server is running. Use the /api/upload endpoint to upload files.');
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);

    const transcription = await openai.audio.transcriptions.create({   //API CALL (sends a req to OPENAI's Whisper API)
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      response_format: "text", 
    });

    fs.unlinkSync(filePath); 

    res.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
