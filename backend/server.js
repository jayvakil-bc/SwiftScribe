const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('OpenAI');
const { createClient } = require('@deepgram/sdk');
require('dotenv').config();


const app = express();
const port = 3000;  

const upload = multer({ dest: 'uploads/' });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
    
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const audioFile = fs.readFileSync(file.path);

        const response = await deepgram.listen.prerecorded.transcribeFile(
            audioFile,
            {
                model: "nova-2",
                smart_format: true,
            }
        );

        console.log("Deepgram API Response:", response);

        if (!response.result || response.error) {
            console.error('Deepgram API returned an error:', response.error);
            return res.status(500).send('Deepgram API Error');
        }

        fs.unlinkSync(file.path);
        const transcript = response.result.results.channels[0].alternatives[0].transcript;
        const markdownNotes = await generateLectureNotes(transcript);
        res.send(`<pre>${markdownNotes}</pre>`); 

    } catch (error) {
        console.error('Error transcribing audio or generating notes:', error);
        res.status(500).send('An error occurred during transcription or note generation.');
    }
});


async function generateLectureNotes(transcript) {
    const prompt = `
    You are an expert note-taker. Convert the following lecture transcription into well-structured and well-formatted notes. Please include headings, bullet points, numbered lists, and any necessary subheadings to make the notes clear and easy to understand. Ensure the notes are organized logically and include key points, important details, and any significant terms or definitions.

    Text for Conversion:
    ${transcript}

    Output Format:
    - Use Markdown format.
    - Start with a title based on the topic of the lecture.
    - Break down the content into sections with appropriate headings (e.g., ## Main Topic, ### Subtopic).
    - Use bullet points for lists and key points.
    - Include code blocks if the content includes technical or code-related information.
    - Use **bold** for important terms or concepts.
    - *Italicize* any supplementary or additional information.

    Return the formatted notes in Markdown.
    `;

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4",
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error generating notes:', error);
        throw new Error('Failed to generate lecture notes.');
    }
}



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

