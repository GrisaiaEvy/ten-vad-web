import { useState, useCallback } from 'react';
import { parseWav, validateWavFormat } from '../utils/wavParser';
import { debugWavFile } from '../utils/debugWav';

export const useAudioProcessor = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [processing, setProcessing] = useState(false);

  const processAudioFile = useCallback(async (file) => {
    if (!file) return null;

    setProcessing(true);
    setFileInfo(null);
    setWarnings([]);
    setErrors([]);

    try {
      // Read file
      const arrayBuffer = await file.arrayBuffer();
      
      // Debug WAV file
      debugWavFile(arrayBuffer);
      
      // Parse WAV file
      const wavInfo = parseWav(arrayBuffer);
      
      // Validate format
      const { warnings: formatWarnings, errors: formatErrors } = validateWavFormat(wavInfo);
      setWarnings(formatWarnings);
      setErrors(formatErrors);
      
      if (formatErrors.length > 0) {
        throw new Error(formatErrors.join(', '));
      }

      // Set file information
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

      return {
        wavInfo,
        arrayBuffer
      };

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