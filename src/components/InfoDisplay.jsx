import React from 'react';
import './InfoDisplay.css';

export default function InfoDisplay({ fileInfo, warnings, errors }) {
  return (
    <>
      {warnings.length > 0 && (
        <section className="warnings">
          <h3>Warnings</h3>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index} className="warning">{warning}</li>
            ))}
          </ul>
        </section>
      )}

      {errors.length > 0 && (
        <section className="errors">
          <h3>Errors</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index} className="error">{error}</li>
            ))}
          </ul>
        </section>
      )}

      {fileInfo && (
        <section className="file-info">
          <h3>File Information</h3>
          <div className="info-grid">
            <div><strong>Name:</strong> {fileInfo.name}</div>
            <div><strong>Size:</strong> {(fileInfo.size / 1024).toFixed(1)} KB</div>
            <div><strong>Duration:</strong> {fileInfo.duration}s</div>
            <div><strong>Sample Rate:</strong> {fileInfo.sampleRate} Hz</div>
            <div><strong>Channels:</strong> {fileInfo.channels}</div>
            <div><strong>Bit Depth:</strong> {fileInfo.bitsPerSample}-bit</div>
          </div>
        </section>
      )}
    </>
  );
} 