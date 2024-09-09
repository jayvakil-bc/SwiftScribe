import React, { useState } from 'react';

const UploadForm = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onFileUpload(file);
    } else {
      alert('Please select an audio file to upload.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="audio">Upload Audio File:</label>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
      </div>
      <button type="submit">Summarize</button>
    </form>
  );
};

export default UploadForm;
