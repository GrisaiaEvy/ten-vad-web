import React from 'react';
import './LoadingStates.css';

export function LoadingState() {
  return (
    <div className="vad-app">
      <div className="loading">
        <h2>Loading VAD Module...</h2>
        <p>Please wait while the WebAssembly module is being loaded.</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}

export function ErrorState({ error }) {
  return (
    <div className="vad-app">
      <div className="error">
        <h2>Failed to Load VAD Module</h2>
        <p>Error: {error}</p>
        <p>Please make sure the WASM files are in the correct location.</p>
      </div>
    </div>
  );
} 