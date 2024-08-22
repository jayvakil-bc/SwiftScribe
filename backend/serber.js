const axios = require('axios');

const transcript = "In today's fast paced world, continuous learning is not just a choice, it's a necessity. Whether you're a student, a professional, or anyone looking to grow, the pursuit of knowledge keeps you adaptable and relevant. The skills you learn today may become outdated tomorrow, so staying curious and proactive in your learning journey is crucial. Embrace new technologies, explore different fields, and never be afraid to challenge yourself. Learning isn't confined to classrooms. It happens every day through experiences, conversations, and even failures. The more you learn, the more you expand your horizons, opening doors to new opportunities and perspectives. Remember the quest for knowledge is a lifelong adventure, and it's one that will keep you sharp, innovative, and ready for whatever the future holds.";




generateLectureNotes(transcript)

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
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            max_tokens: 10000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        //const markdownNotes = response.data.choices[0].message.content.trim();

        const markdownNotes = response.data.choices[0].message.content.trim();

        return markdownNotes;
    } catch (error) {
        console.error('Error generating notes:', error);
        throw new Error('Failed to generate lecture notes.');
    }
}