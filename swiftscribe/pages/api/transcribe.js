export const config = {
  api: {
      bodyParser: false,
  },
};

const multer = require('multer');
const upload = multer();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const formData = new FormData();
  const file = req.file;

  if (!file) {
      return res.status(400).send('No file uploaded.');
  }

  try {
      const response = await fetch('http://localhost:3000/transcribe', {
          method: 'POST',
          body: req.body,
      });

      const result = await response.text();
      res.status(200).send(result);
  } catch (error) {
      console.error('Error processing transcription:', error);
      res.status(500).json({ message: 'An error occurred during transcription.' });
  }
}
