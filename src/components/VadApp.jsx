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
import { encodeWavFromPCM } from '../utils/testAudio';

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
  const handleFileUpload = useCallback(async (file, options = { type: 'wav', sampleRate: 16000 }) => {
    // Reset previous state
    resetAudio();
    resetVad();
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      if (options.type === 'pcm') {
        // 读取裸PCM
        const arrayBuffer = await file.arrayBuffer();
        const sampleRate = options.sampleRate || 16000;
        // 构造wavInfo兼容结构
        const wavInfo = {
          sampleRate,
          channels: 1,
          bitsPerSample: 16,
          dataOffset: 0,
          dataSize: arrayBuffer.byteLength,
          pcmData: new Int16Array(arrayBuffer),
          totalSamples: arrayBuffer.byteLength / 2,
          samplesPerChannel: arrayBuffer.byteLength / 2
        };
        // 生成可播放的wav blob（用于AudioPlayer）
        const wavBuffer = encodeWavFromPCM(new Int16Array(arrayBuffer), sampleRate, 1);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        await processVad(wavInfo, arrayBuffer);
        return;
      }
      // WAV流程
      const audioData = await processAudioFile(file);
      if (!audioData) return;
      const { wavInfo, arrayBuffer } = audioData;
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioBlob(blob);
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