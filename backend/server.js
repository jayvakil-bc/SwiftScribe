const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@deepgram/sdk');
require('dotenv').config();

const app = express();
const port = 3000;

// Multer setup for file handling 
const upload = multer({ dest: 'uploads/' });

// Deepgram API setup
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Serve the upload HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

// Route to upload and transcribe audio
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        // Read the uploaded audio file
        const audioFile = fs.readFileSync(file.path);

        // Call the Deepgram API to transcribe the audio
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioFile,
            {
                model: "nova-2",
                smart_format: true,
            }
        );

        // Delete the file after processing
        fs.unlinkSync(file.path);

        // Handle any errors
        if (error) {
            throw error;
        }

        // Send the transcription result back to the client
        res.json(result);
    } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).send('An error occurred while transcribing the audio.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

