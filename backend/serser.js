const express = require('express');
const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Initialize Notion client with the integration key from environment variables
const notion = new Client({ auth: process.env.NOTION_KEY });

app.get('/', (req, res) => {
    res.send('Notion API Test');
});

// This endpoint will directly create a Notion page with predefined content
app.post('/test-notion', async (req, res) => {
    try {
        // Define the content you want to add to Notion
        const content = `
            # Lecture Notes on Character Analysis: Mister Rochester

            ## Overview
            - **Main Character**: Mister Rochester
            - **Context**: Analyzing his attributes and relationships in the narrative.

            ## Key Characteristics of Mister Rochester
            1. **Complex Personality**
               - **Subdued Nature**: Rochester often appears somber and serious.
               - **Contradictory Traits**: He exhibits both commanding authority and vulnerability.
               
            2. **Romantic Involvement**
               - **Relationship with Jane Eyre**: His bond with Jane showcases deep emotional connections.
               - **Devotion**: He displays a significant commitment toward Jane despite obstacles.

            ## Conclusion
            - Mister Rochester serves as a pivotal character whose emotional struggles and growth reflect major themes in the narrative.
        `;

        // Create the Notion page
        const response = await notion.pages.create({
            cover: {
                type: "external",
                external: {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQL1vfD1t88e0tw4cPRG5VneFn14Yu7bzNU8ePWbn5W7UbH9jn2bJUGIYB-h0ZugGfrlQ&usqp=CAU"
                }
            },
            icon: {
                type: "emoji",
                emoji: "📝"
            },
            parent: {
                type: "database_id",
                database_id: process.env.NOTION_DATABASE_ID,
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: "Lecture Notes"
                            }
                        }
                    ]
                },
            },
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [
                            {
                                type: 'text',
                                text: {
                                    content: content, // Use predefined content
                                },
                            },
                        ],
                    },
                },
            ],
        });

        console.log('Success! Page created in Notion:', response);
        res.status(200).send('Page created in Notion successfully!');
    } catch (error) {
        console.error('Error creating page in Notion:', error);
        res.status(500).send('Failed to create page in Notion.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
