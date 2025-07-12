import React from 'react';
import { createTestWavFile } from '../utils/testAudio';
import './FileUpload.css';

export default function FileUpload({ onFileUpload, processing, moduleLoading }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const testWithGeneratedAudio = async () => {
    try {
      // Use shorter audio file for testing
      const testFile = createTestWavFile(1000, 'test_audio.wav'); // 1 second audio
      console.log('Generated test file:', testFile);
      
      onFileUpload(testFile);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <section className="file-upload">
      <h2>Upload Audio File</h2>
      <div className="upload-area">
        <input
          type="file"
          accept=".wav"
          onChange={handleFileChange}
          disabled={processing}
          id="file-input"
        />
        <label htmlFor="file-input" className="upload-button">
          {processing ? 'Processing...' : 'Choose WAV File'}
        </label>
        <p className="file-requirements">
          Supported format: 16kHz, 16-bit PCM WAV file (mono preferred)
        </p>
        <div className="test-actions">
          <button 
            onClick={testWithGeneratedAudio} 
            disabled={processing || moduleLoading}
            className="test-button"
          >
            Test with Generated Audio
          </button>
        </div>
      </div>
    </section>
  );
} 