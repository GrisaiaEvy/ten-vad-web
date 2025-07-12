// Parse WAV file header, return PCM data and format information
export function parseWav(arrayBuffer) {
  const buffer = new DataView(arrayBuffer);
  
  console.log(`Parsing WAV file: ${buffer.byteLength} bytes`);
  
  if (buffer.byteLength < 44) {
    throw new Error('Invalid WAV file: too small');
  }
  
  // Check RIFF header
  const riffHeader = String.fromCharCode(...new Uint8Array(arrayBuffer, 0, 4));
  if (riffHeader !== 'RIFF') {
    throw new Error('Invalid WAV file: missing RIFF header');
  }
  
  // Check WAVE format
  const waveHeader = String.fromCharCode(...new Uint8Array(arrayBuffer, 8, 4));
  if (waveHeader !== 'WAVE') {
    throw new Error('Invalid WAV file: not WAVE format');
  }

  let offset = 12;
  let sampleRate = 0;
  let channels = 0;
  let bitsPerSample = 0;
  let dataOffset = -1;
  let dataSize = 0;

  // Parse chunks
  while (offset < buffer.byteLength - 8) {
    // Check if enough bytes to read chunk ID and size
    if (offset + 8 > buffer.byteLength) {
      console.warn(`Not enough bytes to read chunk header at offset ${offset}`);
      break;
    }
    
    const chunkId = String.fromCharCode(...new Uint8Array(arrayBuffer, offset, 4));
    const chunkSize = buffer.getUint32(offset + 4, true);
    
    console.log(`Found chunk: ${chunkId} at offset ${offset}, size: ${chunkSize}`);
    
    // Check if chunk extends beyond file boundary
    if (offset + 8 + chunkSize > buffer.byteLength) {
      console.warn(`Chunk ${chunkId} extends beyond file boundary (offset: ${offset}, size: ${chunkSize}, file size: ${buffer.byteLength}), stopping parse`);
      break;
    }
    
    if (chunkId === 'fmt ') {
      // Format chunk - check if enough bytes
      if (offset + 24 > buffer.byteLength) {
        throw new Error('Invalid WAV file: fmt chunk too small');
      }
      
      const audioFormat = buffer.getUint16(offset + 8, true);
      channels = buffer.getUint16(offset + 10, true);
      sampleRate = buffer.getUint32(offset + 12, true);
      bitsPerSample = buffer.getUint16(offset + 22, true);
      
      if (audioFormat !== 1) {
        throw new Error('Unsupported WAV format: only PCM is supported');
      }
      
      if (bitsPerSample !== 16) {
        throw new Error('Unsupported bit depth: only 16-bit is supported');
      }
    } else if (chunkId === 'data') {
      // Data chunk
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    
    offset += 8 + chunkSize;
    // Align to even byte boundary
    if (chunkSize % 2 === 1) {
      offset++;
    }
  }
  
  if (dataOffset === -1) {
    throw new Error('Invalid WAV file: no data chunk found');
  }
  
  // Check if data extends beyond file boundary
  if (dataOffset + dataSize > buffer.byteLength) {
    throw new Error(`Invalid WAV file: data chunk extends beyond file boundary (dataOffset: ${dataOffset}, dataSize: ${dataSize}, file size: ${buffer.byteLength})`);
  }
  
  // Ensure data size is even (16-bit = 2 bytes per sample)
  if (dataSize % 2 !== 0) {
    console.warn('Data size is odd, truncating to even number of bytes');
    dataSize = dataSize - 1;
  }
  
  console.log(`Creating Int16Array: offset=${dataOffset}, length=${dataSize / 2}, total bytes=${dataSize}`);
  
  // Additional boundary check
  if (dataOffset < 0 || dataSize < 0 || dataOffset + dataSize > arrayBuffer.byteLength) {
    throw new Error(`Invalid array bounds: offset=${dataOffset}, size=${dataSize}, buffer size=${arrayBuffer.byteLength}`);
  }
  
  const pcmData = new Int16Array(arrayBuffer, dataOffset, dataSize / 2);
  
  console.log(`WAV parsed successfully: ${sampleRate}Hz, ${channels} channels, ${bitsPerSample}-bit, ${pcmData.length} samples`);
  
  return {
    sampleRate,
    channels,
    bitsPerSample,
    dataOffset,
    dataSize,
    pcmData,
    totalSamples: dataSize / (bitsPerSample / 8),
    samplesPerChannel: dataSize / (bitsPerSample / 8) / channels
  };
}

// Validate WAV file format requirements
export function validateWavFormat(wavInfo) {
  const warnings = [];
  const errors = [];

  if (wavInfo.sampleRate !== 16000) {
    warnings.push(`Sample rate is ${wavInfo.sampleRate}Hz, recommended: 16000Hz`);
  }

  if (wavInfo.channels !== 1) {
    warnings.push(`Audio has ${wavInfo.channels} channels, mono (1 channel) is recommended`);
  }

  if (wavInfo.bitsPerSample !== 16) {
    errors.push(`Bit depth is ${wavInfo.bitsPerSample}-bit, only 16-bit is supported`);
  }

  const duration = wavInfo.samplesPerChannel / wavInfo.sampleRate;
  if (duration > 300) {
    warnings.push(`Audio duration is ${duration.toFixed(1)}s, very long files may take time to process`);
  }

  return { warnings, errors };
} 