import React, { useState } from 'react';
import UploadForm from './components/UploadForm';

function App() {
  const [loading, setLoading] = useState(false);
  const [htmlNotes, setHtmlNotes] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError('');
    setHtmlNotes('');

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('http://localhost:3000/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.log('Error response body:', errorMessage);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.text();
      setHtmlNotes(result);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('An error occurred while processing the file.');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard function
  const handleCopy = () => {
    if (htmlNotes) {
      const plainText = htmlNotes.replace(/<[^>]+>/g, ''); // Remove HTML tags for plain text copying
      navigator.clipboard.writeText(plainText).then(() => {
        alert('Summary copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  // Download as .txt file function
  const handleDownload = () => {
    if (htmlNotes) {
      const plainText = htmlNotes.replace(/<[^>]+>/g, ''); // Remove HTML tags for plain text downloading
      const blob = new Blob([plainText], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'summary.txt';
      link.click();
    }
  };

  return (
    <div className="App">
      <h1>Audio Summarizer</h1>
      <UploadForm onFileUpload={handleFileUpload} />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {htmlNotes && (
        <div>
          <h2>Summarized Notes</h2>
          <div
            dangerouslySetInnerHTML={{ __html: htmlNotes }}
          ></div>

          {/* Buttons for Copy and Download */}
          <button onClick={handleCopy} style={{ marginRight: '10px' }}>
            Copy to Clipboard
          </button>
          <button onClick={handleDownload}>
            Download as .txt
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
