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

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioFile,
            {
                model: "nova-2",
                smart_format: true,
            }
        );

        fs.unlinkSync(file.path);

        //res.json(result.results.channels[0].alternatives[0].transcript); 
        //const transcript = results.results.channels[0].alternatives[0].transcript;

        const transcript = result.results.channels[0].alternatives[0].transcript;
        
        const markdownNotes = await generateLectureNotes(transcript);

        res.json( markdownNotes );

    } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).send('An error occurred while transcribing the audio.');
    }
});

//const transcript = "In today's fast paced world, continuous learning is not just a choice, it's a necessity. Whether you're a student, a professional, or anyone looking to grow, the pursuit of knowledge keeps you adaptable and relevant. The skills you learn today may become outdated tomorrow, so staying curious and proactive in your learning journey is crucial. Embrace new technologies, explore different fields, and never be afraid to challenge yourself. Learning isn't confined to classrooms. It happens every day through experiences, conversations, and even failures. The more you learn, the more you expand your horizons, opening doors to new opportunities and perspectives. Remember the quest for knowledge is a lifelong adventure, and it's one that will keep you sharp, innovative, and ready for whatever the future holds."
//const transc = generateLectureNotes(transcript);
//console.log(transc);

// Function to call the ChatGPT API to generate structured lecture notes in Markdown
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

    Return the formatted notes in Markdown, ready to be imported into Notion.
    `;

    try {

        const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o-mini",
        });
        //console.log(chatCompletion.choices[0].message.content);
    
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error generating notes:', error);
        throw new Error('Failed to generate lecture notes.');
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
