import { useState } from 'react';

export default function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [transcriptionResult, setTranscriptionResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            alert("Please select an audio file to upload.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('audio', selectedFile);

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error in transcription');
            }

            const result = await response.text();
            setTranscriptionResult(result);
        } catch (error) {
            console.error('Error during transcription:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Transcribe Audio to Notes</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <label htmlFor="audio">Upload an audio file (MP3, WAV, etc.):</label><br/>
                <input type="file" name="audio" id="audio" accept="audio/*" onChange={handleFileChange} required/><br/><br/>
                <button type="submit">Submit</button>
            </form>
            {loading && <p>Transcribing... Please wait.</p>}
            <div id="transcription-result" dangerouslySetInnerHTML={{ __html: transcriptionResult }}></div>
        </div>
    );
}
