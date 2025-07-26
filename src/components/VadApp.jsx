import React, { useState, useCallback, useEffect } from 'react';
import { useAudioProcessor } from '../hooks/useAudioProcessor';
import { useVadProcessor } from '../hooks/useVadProcessor';
import AppHeader from './AppHeader';
import FileUpload from './FileUpload';
import InfoDisplay from './InfoDisplay';
import AudioPlayer from './AudioPlayer';
import ResultsDisplay from './ResultsDisplay';
import { LoadingState, ErrorState } from './LoadingStates';
import './VadApp.css';

export default function VadApp() {
  const { 
    fileInfo, 
    warnings, 
    errors, 
    processing: audioProcessing, 
    processAudioFile, 
    reset: resetAudio 
  } = useAudioProcessor();

  const { 
    vadModule, 
    moduleLoading, 
    moduleError, 
    results, 
    processing: vadProcessing, 
    processVad, 
    reset: resetVad, 
    getVADVersion
  } = useVadProcessor();

  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    // Reset previous state
    resetAudio();
    resetVad();
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      // Process audio file
      const audioData = await processAudioFile(file);
      if (!audioData) return;

      const { wavInfo, arrayBuffer } = audioData;

      // Create audio URL for wavesurfer
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      // Update audioBlob state for AudioPlayer
      setAudioBlob(blob);

      // Process VAD
      await processVad(wavInfo, arrayBuffer);

    } catch (error) {
      console.error('File processing failed:', error);
    }
  }, [processAudioFile, processVad, resetAudio, resetVad]);

  // Cleanup audio URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (moduleLoading) {
    return <LoadingState />;
  }

  if (moduleError) {
    return <ErrorState error={moduleError} />;
  }

  const processing = audioProcessing || vadProcessing;

  return (
    <div className="vad-app">
      <AppHeader 
        vadModule={vadModule} 
        getVADVersion={getVADVersion}
      />

      <main className="app-main">
        <FileUpload 
          onFileUpload={handleFileUpload}
          processing={processing}
          moduleLoading={moduleLoading}
        />

        <InfoDisplay 
          fileInfo={fileInfo}
          warnings={warnings}
          errors={errors}
        />

        <AudioPlayer 
          audioUrl={audioUrl}
          audioBlob={audioBlob}
          voiceSegments={results?.speechSegments || []}
        />
        {/* Debug info */}
        <div style={{ margin: '10px', padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
          <strong>Debug Info:</strong><br/>
          Audio URL: {audioUrl ? 'Set' : 'Not set'}<br/>
          Audio Blob: {audioBlob ? 'Set' : 'Not set'}<br/>
          Speech Segments: {results?.speechSegments?.length || 0}<br/>
          Results: {results ? 'Available' : 'Not available'}
        </div>

        <ResultsDisplay results={results} />
      </main>
    </div>
  );
} 