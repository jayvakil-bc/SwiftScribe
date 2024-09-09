const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('OpenAI');
const { createClient } = require('@deepgram/sdk');
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors());
const port = 3001;

const upload = multer({ dest: 'uploads/' });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

        console.log(response);

        if (!response.result || response.error) {
            console.error('Deepgram API returned an error:', response.error);
            return res.status(500).send('Deepgram API Error');
        }

        //fs.unlinkSync(file.path);
        
        // Get transcript from Deepgram API
        const transcript = response.result.results.channels[0].alternatives[0].transcript;

        // Pass transcript to OpenAI to format the lecture notes in HTML
        const htmlNotes = await generateLectureNotes(transcript);
        console.log(htmlNotes);
        // Clean up the uploaded audio file
        //fs.unlink(file.path, (err) => {
        //    if (err) {
        //        console.error('Error deleting file:', err);
        //    }
        //});

        // Send the formatted HTML back to the client
        res.set('Content-Type', 'text/html');
        res.send(htmlNotes);

    } catch (error) {
        console.error('Error transcribing audio or generating notes:', error);
        res.status(500).send('An error occurred during transcription or note generation.');
    }
});

async function generateLectureNotes(transcript) {
    const prompt = `
    You are an expert at converting lecture transcriptions into structured, clean, and easy-to-read notes formatted for display in HTML. Please organize and format the following lecture transcript according to these guidelines:

    1. **Title**: Start with a clear and descriptive title that reflects the topic of the lecture.
    
    2. **Sections and Headings**: Use the following structure:
        - Wrap main topics in <h1> tags.
        - Wrap subtopics in <h2> or <h3> tags, depending on the depth of the section.

    3. **Key Points and Lists**: 
        - Use unordered (<ul>) or ordered lists (<ol>) for key points or sequences.
        - For key terms or important points, use <strong> tags to make them bold.
        - Use <em> tags for supplementary or additional context.

    4. **Paragraphs and Formatting**: Ensure the text is broken into readable paragraphs using <p> tags. Avoid long blocks of text.

    5. **Technical Content (if any)**: If the lecture contains code or technical information, wrap it in <pre> and <code> tags to preserve formatting.

    6. **Clear and Concise**: Summarize lengthy sections when possible to make the content digestible, while maintaining the essential information.

    Do not add any extra commentary or explanations, just return the clean, formatted HTML for the transcript.

    Here is the lecture transcription to be formatted:

    ${transcript}

    Please return the result formatted in HTML, ready for display on a webpage.
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
