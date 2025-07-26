import { useState, useCallback, useEffect } from 'react';
import { NonRealTimeTenVAD } from 'ten-vad-lib';

// VAD configuration constants
const HOP_SIZE = 256;          // 16ms per frame
const VOICE_THRESHOLD = 0.5;   // Voice detection threshold

export const useVadProcessor = () => {
  const [vadInstance, setVadInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Initialize VAD instance
  useEffect(() => {
    const initVad = async () => {
      try {
        console.log('Initializing VAD instance...');
        setLoading(true);
        setError(null);
        
        // Wait for WASM module to be available
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.createVADModule && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.createVADModule) {
          // Try to load the script as ES module using dynamic import
          try {
            const module = await import(/* webpackIgnore: true */ '/wasm/ten_vad.js');
            window.createVADModule = module.default;
          } catch (error) {
            console.warn('Failed to load as ES module, trying as regular script:', error);
            // Fallback to regular script loading
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = '/wasm/ten_vad.js';
              script.type = 'module';
              script.onload = () => {
                setTimeout(resolve, 200);
              };
              script.onerror = () => reject(new Error('Failed to load WASM script'));
              document.head.appendChild(script);
            });
            
            // Wait a bit more for the module to initialize
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        if (!window.createVADModule) {
          throw new Error('createVADModule not found after loading script');
        }
        
        console.log('WASM module loaded, creating VAD instance...');
        
        const vad = await NonRealTimeTenVAD.new({
          hopSize: HOP_SIZE,
          voiceThreshold: VOICE_THRESHOLD,
          minSpeechDuration: 100,
          wasmPath: '/wasm/ten_vad.wasm',
          jsPath: '/wasm/ten_vad.js'
        });
        
        console.log('VAD instance created successfully:', vad);
        setVadInstance(vad);
        
        setLoading(false);
      } catch (err) {
        console.error('VAD initialization failed:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initVad();
  }, []);

  // 简单线性重采样（仅支持单声道）
  function resampleTo16k(float32Audio, fromSampleRate) {
    if (fromSampleRate === 16000) return float32Audio;
    const ratio = fromSampleRate / 16000;
    const newLength = Math.round(float32Audio.length / ratio);
    const resampled = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const left = Math.floor(srcIndex);
      const right = Math.min(left + 1, float32Audio.length - 1);
      const frac = srcIndex - left;
      resampled[i] = float32Audio[left] * (1 - frac) + float32Audio[right] * frac;
    }
    return resampled;
  }

  const processVad = useCallback(async (wavInfo, arrayBuffer) => {
    if (!vadInstance) {
      throw new Error('VAD instance not loaded');
    }

    setProcessing(true);
    setResults(null);

    try {
      let float32Audio, sampleRate;
      if (wavInfo.dataOffset === 0 && wavInfo.bitsPerSample === 16 && wavInfo.channels === 1) {
        // 认为是裸PCM
        const pcm16 = new Int16Array(arrayBuffer);
        float32Audio = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
          float32Audio[i] = pcm16[i] / 32768;
        }
        sampleRate = wavInfo.sampleRate;
      } else {
        // 走原WAV流程
        const pcm16 = new Int16Array(wavInfo.dataSize / 2);
        const dv = new DataView(arrayBuffer, wavInfo.dataOffset, wavInfo.dataSize);
        for (let i = 0; i < pcm16.length; i++) {
          pcm16[i] = dv.getInt16(i * 2, true);
        }
        float32Audio = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
          float32Audio[i] = pcm16[i] / 32768; 
        }
        sampleRate = wavInfo.sampleRate;
      }
      // 自动重采样到16k
      if (sampleRate !== 16000) {
        float32Audio = resampleTo16k(float32Audio, sampleRate);
        sampleRate = 16000;
      }
      const result = await vadInstance.process(float32Audio, sampleRate);
      const convertedResults = {
        speechSegments: result.speechSegments.map(segment => ({
          startFrame: Math.floor(segment.start / 16),
          endFrame: Math.floor(segment.end / 16),
          startTime: segment.start,
          endTime: segment.end,
          duration: segment.end - segment.start,
          avgProbability: segment.probability
        })),
        statistics: {
          totalFrames: result.statistics.totalFrames,
          voiceFrames: result.statistics.voiceFrames,
          voicePercentage: result.statistics.voicePercentage,
          processingTime: result.statistics.processingTime,
          totalAudioTime: (float32Audio.length / sampleRate) * 1000,
          rtf: result.statistics.realTimeFactor
        }
      };
      setResults(convertedResults);
      return convertedResults;
    } catch (error) {
      console.error('VAD processing failed:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [vadInstance]);

  const reset = useCallback(() => {
    setResults(null);
    setProcessing(false);
  }, []);

  const getVADVersion = useCallback(() => {
    return 'Ten VAD Library v1.0.0';
  }, []);

  return {
    vadModule: vadInstance,
    moduleLoading: loading,
    moduleError: error,
    results,
    processing,
    processVad,
    reset,
    getVADVersion,
    isMockMode: false
  };
}; 