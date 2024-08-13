import React, { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [transcription, setTranscription] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setTranscription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file first!');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setTranscription(data.transcription);
        setMessage('File uploaded and transcribed successfully!');
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (error) {
      setMessage('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          SwiftScribe: Upload Audio/Video
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
          {message && (
            <p
              className={`text-center mt-4 font-medium ${
                message.includes('successfully')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
          {transcription && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Transcription:</h2>
              <p className="text-gray-700 whitespace-pre-line">{transcription}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
