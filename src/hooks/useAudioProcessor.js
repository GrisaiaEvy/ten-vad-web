import { useState, useCallback } from 'react';
import { parseWav, validateWavFormat } from '../utils/wavParser';
import { debugWavFile } from '../utils/debugWav';

export const useAudioProcessor = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [processing, setProcessing] = useState(false);

  const processAudioFile = useCallback(async (file, options = { type: 'wav', sampleRate: 16000 }) => {
    if (!file) return null;

    setProcessing(true);
    setFileInfo(null);
    setWarnings([]);
    setErrors([]);

    try {
      if (options.type === 'pcm') {
        const arrayBuffer = await file.arrayBuffer();
        const sampleRate = options.sampleRate || 16000;
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
        setFileInfo({
          name: file.name,
          size: file.size,
          duration: (wavInfo.samplesPerChannel / wavInfo.sampleRate).toFixed(2),
          sampleRate: wavInfo.sampleRate,
          channels: wavInfo.channels,
          bitsPerSample: wavInfo.bitsPerSample,
          wavInfo,
          arrayBuffer
        });
        return { wavInfo, arrayBuffer };
      }
      // WAV流程
      const arrayBuffer = await file.arrayBuffer();
      debugWavFile(arrayBuffer);
      const wavInfo = parseWav(arrayBuffer);
      const { warnings: formatWarnings, errors: formatErrors } = validateWavFormat(wavInfo);
      setWarnings(formatWarnings);
      setErrors(formatErrors);
      if (formatErrors.length > 0) {
        throw new Error(formatErrors.join(', '));
      }
      setFileInfo({
        name: file.name,
        size: file.size,
        duration: (wavInfo.samplesPerChannel / wavInfo.sampleRate).toFixed(2),
        sampleRate: wavInfo.sampleRate,
        channels: wavInfo.channels,
        bitsPerSample: wavInfo.bitsPerSample,
        wavInfo,
        arrayBuffer
      });
      return { wavInfo, arrayBuffer };
    } catch (error) {
      setErrors([error.message]);
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFileInfo(null);
    setWarnings([]);
    setErrors([]);
    setProcessing(false);
  }, []);

  return {
    fileInfo,
    warnings,
    errors,
    processing,
    processAudioFile,
    reset
  };
}; 