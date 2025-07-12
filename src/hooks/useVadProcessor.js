import { useState, useCallback } from 'react';
import useVadModule from '../wasm/useVadModule';

// VAD configuration constants
const HOP_SIZE = 256;          // 16ms per frame
const VOICE_THRESHOLD = 0.5;   // Voice detection threshold

// Add helper functions to VAD module
function addHelperFunctions(vadModule) {
  if (!vadModule.getValue) {
    vadModule.getValue = function(ptr, type) {
      switch (type) {
        case 'i32': return vadModule.HEAP32[ptr >> 2];
        case 'float': return vadModule.HEAPF32[ptr >> 2];
        default: throw new Error(`Unsupported type: ${type}`);
      }
    };
  }
  
  if (!vadModule.UTF8ToString) {
    vadModule.UTF8ToString = function(ptr) {
      if (!ptr) return '';
      let result = '';
      let i = ptr;
      while (vadModule.HEAPU8[i]) {
        result += String.fromCharCode(vadModule.HEAPU8[i++]);
      }
      return result;
    };
  }
}

// Get VAD version information
function getVADVersion(vadModule) {
  if (!vadModule || !vadModule._ten_vad_get_version) {
    return 'Placeholder Module';
  }
  
  try {
    const versionPtr = vadModule._ten_vad_get_version();
    if (versionPtr) {
      return vadModule.UTF8ToString(versionPtr);
    }
    return 'Unknown Version';
  } catch (error) {
    console.error('Failed to get VAD version:', error);
    return 'Error Getting Version';
  }
}

export const useVadProcessor = () => {
  const { vadModule, loading: moduleLoading, error: moduleError } = useVadModule();
  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);

  const processVad = useCallback(async (wavInfo, arrayBuffer) => {
    if (!vadModule) {
      throw new Error('VAD module not loaded');
    }

    setProcessing(true);
    setResults(null);

    try {
      // Add helper functions
      addHelperFunctions(vadModule);

      // Create VAD instance
      const vadHandlePtr = vadModule._malloc(4);
      const createResult = vadModule._ten_vad_create(vadHandlePtr, HOP_SIZE, VOICE_THRESHOLD);
      
      if (createResult !== 0) {
        throw new Error(`VAD creation failed with code: ${createResult}`);
      }
      
      const vadHandle = vadModule.getValue(vadHandlePtr, 'i32');

      // Process audio data - align with Node.js
      const pcm16 = new Int16Array(wavInfo.dataSize / 2);
      const dv = new DataView(arrayBuffer, wavInfo.dataOffset, wavInfo.dataSize);
      for (let i = 0; i < pcm16.length; i++) {
        pcm16[i] = dv.getInt16(i * 2, true); // Little endian
      }
      let inputBuf = pcm16;

      console.log(`Processing audio: ${inputBuf.length} samples, ${wavInfo.channels} channels`);
      
      // Calculate correct sample count (consistent with test_node.js)
      const sampleNum = wavInfo.channels === 1 ? 
        wavInfo.samplesPerChannel : 
        Math.floor(wavInfo.samplesPerChannel);
      
      // Create processedInput, ensure correct length (consistent with test_node.js)
      let processedInput = inputBuf;
      if (wavInfo.channels > 1) {
        console.log(`Extracting mono from ${wavInfo.channels} channels...`);
        processedInput = new Int16Array(Math.floor(inputBuf.length / wavInfo.channels));
        for (let i = 0; i < processedInput.length; i++) {
          processedInput[i] = inputBuf[i * wavInfo.channels]; // Take first channel
        }
      }
      
      // Frame processing
      const frameNum = Math.floor(sampleNum / HOP_SIZE);
      
      // Ensure processedInput has enough length to process all frames
      const requiredLength = frameNum * HOP_SIZE;
      if (processedInput.length < requiredLength) {
        console.log(`Extending processedInput from ${processedInput.length} to ${requiredLength} samples`);
        const extendedInput = new Int16Array(requiredLength);
        extendedInput.set(processedInput);
        processedInput = extendedInput;
      }
      const outProbs = new Float32Array(frameNum);
      const outFlags = new Int32Array(frameNum);

      const startTime = Date.now();

      for (let i = 0; i < frameNum; i++) {
        const frameStart = i * HOP_SIZE;
        const frameData = processedInput.slice(frameStart, frameStart + HOP_SIZE);
        
        const audioPtr = vadModule._malloc(HOP_SIZE * 2);
        const probPtr = vadModule._malloc(4);
        const flagPtr = vadModule._malloc(4);
        
        try {
          vadModule.HEAP16.set(frameData, audioPtr / 2);
          
          const result = vadModule._ten_vad_process(
            vadHandle, audioPtr, HOP_SIZE, probPtr, flagPtr
          );
          
          if (result === 0) {
            outProbs[i] = vadModule.getValue(probPtr, 'float');
            outFlags[i] = vadModule.getValue(flagPtr, 'i32');
          } else {
            console.error(`Frame ${i} processing failed with code: ${result}`);
            outProbs[i] = 0.0;
            outFlags[i] = 0;
          }
        } finally {
          vadModule._free(audioPtr);
          vadModule._free(probPtr);
          vadModule._free(flagPtr);
        }
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Destroy VAD instance
      vadModule._ten_vad_destroy(vadHandlePtr);
      vadModule._free(vadHandlePtr);

      // Calculate statistics
      const voiceFrames = outFlags.filter(flag => flag === 1).length;
      const voicePercentage = (voiceFrames / frameNum * 100).toFixed(1);
      const totalAudioTime = (sampleNum / wavInfo.sampleRate) * 1000;
      const rtf = processingTime / totalAudioTime;

      // Merge consecutive voice frames into time segments
      const voiceSegments = [];
      let segmentStart = -1;
      let segmentEnd = -1;
      
      for (let i = 0; i < frameNum; i++) {
        if (outFlags[i] === 1) {
          // Voice frame
          if (segmentStart === -1) {
            // Start new voice segment
            segmentStart = i;
          }
          segmentEnd = i;
        } else {
          // Non-voice frame
          if (segmentStart !== -1) {
            // End current voice segment
            const startTime = (segmentStart * HOP_SIZE / wavInfo.sampleRate) * 1000;
            const endTime = ((segmentEnd + 1) * HOP_SIZE / wavInfo.sampleRate) * 1000;
            const duration = endTime - startTime;
            
            voiceSegments.push({
              startFrame: segmentStart,
              endFrame: segmentEnd,
              startTime: startTime,
              endTime: endTime,
              duration: duration,
              avgProbability: outProbs.slice(segmentStart, segmentEnd + 1).reduce((sum, prob) => sum + prob, 0) / (segmentEnd - segmentStart + 1)
            });
            
            segmentStart = -1;
            segmentEnd = -1;
          }
        }
      }
      
      // Process last voice segment (if audio ends with voice)
      if (segmentStart !== -1) {
        const startTime = (segmentStart * HOP_SIZE / wavInfo.sampleRate) * 1000;
        const endTime = ((segmentEnd + 1) * HOP_SIZE / wavInfo.sampleRate) * 1000;
        const duration = endTime - startTime;
        
        voiceSegments.push({
          startFrame: segmentStart,
          endFrame: segmentEnd,
          startTime: startTime,
          endTime: endTime,
          duration: duration,
          avgProbability: outProbs.slice(segmentStart, segmentEnd + 1).reduce((sum, prob) => sum + prob, 0) / (segmentEnd - segmentStart + 1)
        });
      }

      const results = {
        outProbs,
        outFlags,
        frameNum,
        voiceFrames,
        voicePercentage,
        processingTime,
        totalAudioTime,
        rtf,
        voiceSegments
      };

      setResults(results);
      return results;

    } catch (error) {
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [vadModule]);

  const reset = useCallback(() => {
    setResults(null);
    setProcessing(false);
  }, []);

  return {
    vadModule,
    moduleLoading,
    moduleError,
    results,
    processing,
    processVad,
    reset,
    getVADVersion: () => getVADVersion(vadModule)
  };
}; 