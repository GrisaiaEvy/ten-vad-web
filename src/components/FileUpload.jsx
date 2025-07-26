import React, { useState } from 'react';
import { createTestWavFile } from '../utils/testAudio';
import './FileUpload.css';

export default function FileUpload({ onFileUpload, processing, moduleLoading }) {
  const [fileType, setFileType] = useState('wav');
  const [pcmSampleRate, setPcmSampleRate] = useState(16000);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (fileType === 'pcm') {
        onFileUpload(file, { type: 'pcm', sampleRate: Number(pcmSampleRate) });
      } else {
        onFileUpload(file, { type: 'wav' });
      }
    }
  };

  const testWithGeneratedAudio = async () => {
    try {
      const testFile = createTestWavFile(1000, 'test_audio.wav');
      onFileUpload(testFile, { type: 'wav' });
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <section className="file-upload">
      <h2>Upload Audio File</h2>
      <div className="upload-area">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>
            <input
              type="radio"
              name="fileType"
              value="wav"
              checked={fileType === 'wav'}
              onChange={() => setFileType('wav')}
              disabled={processing}
            /> WAV
          </label>
          <label>
            <input
              type="radio"
              name="fileType"
              value="pcm"
              checked={fileType === 'pcm'}
              onChange={() => setFileType('pcm')}
              disabled={processing}
            /> PCM
          </label>
          {fileType === 'pcm' && (
            <select
              value={pcmSampleRate}
              onChange={e => setPcmSampleRate(Number(e.target.value))}
              style={{ width: 140 }}
              disabled={processing}
            >
              <option value={8000}>8000 Hz (8k)</option>
              <option value={16000}>16000 Hz (16k)</option>
              <option value={32000}>32000 Hz (32k)</option>
              <option value={48000}>48000 Hz (48k)</option>
            </select>
          )}
        </div>
        <input
          type="file"
          accept={fileType === 'wav' ? '.wav' : '.pcm,.raw'}
          onChange={handleFileChange}
          disabled={processing}
          id="file-input"
        />
        <label htmlFor="file-input" className="upload-button">
          {processing ? 'Processing...' : fileType === 'wav' ? 'Choose WAV File' : 'Choose PCM File'}
        </label>
        <p className="file-requirements">
          {fileType === 'wav'
            ? 'Supported format: 16kHz, 16-bit PCM WAV file (mono preferred)'
            : 'Supported: 16-bit signed PCM, please enter correct sample rate'}
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