import React from 'react';
import './AppHeader.css';

export default function AppHeader({ vadModule, getVADVersion }) {
  return (
    <header className="app-header">
      <h1>TEN VAD Web</h1>
      <p>Voice Activity Detection using WebAssembly</p>
      <p className="version">VAD Version: {getVADVersion()}</p>
      <p className="module-status">
        {vadModule && vadModule._ten_vad_get_version ? 
          '✅ VAD Module Loaded' : 
          '⚠️ Using Placeholder Module'
        }
      </p>
    </header>
  );
} 