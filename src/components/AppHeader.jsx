import React from 'react';
import './AppHeader.css';

export default function AppHeader({ vadModule, getVADVersion }) {
  return (
    <header className="app-header">
      <h1>TEN VAD Web</h1>
      <p>Voice Activity Detection using Ten VAD Library</p>
      <p className="version">VAD Version: {getVADVersion()}</p>
      <p className="module-status">
        {vadModule ? '✅ VAD Library Loaded' : '⚠️ VAD Library Loading...'}
      </p>
    </header>
  );
} 