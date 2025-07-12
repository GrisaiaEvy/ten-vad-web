// WAV file debug utility
export function debugWavFile(arrayBuffer) {
  console.log('=== WAV File Debug ===');
  console.log(`File size: ${arrayBuffer.byteLength} bytes`);
  
  const buffer = new DataView(arrayBuffer);
  
  // Check file header
  if (buffer.byteLength < 44) {
    console.error('File too small for WAV format');
    return;
  }
  
  // Read RIFF header
  const riffHeader = String.fromCharCode(...new Uint8Array(arrayBuffer, 0, 4));
  console.log(`RIFF header: ${riffHeader}`);
  
  // Read file size
  const fileSize = buffer.getUint32(4, true);
  console.log(`File size in header: ${fileSize}`);
  
  // Read WAVE identifier
  const waveHeader = String.fromCharCode(...new Uint8Array(arrayBuffer, 8, 4));
  console.log(`WAVE header: ${waveHeader}`);
  
  // Parse chunks
  let offset = 12;
  let chunkCount = 0;
  
  while (offset < buffer.byteLength - 8 && chunkCount < 10) {
    if (offset + 8 > buffer.byteLength) {
      console.warn(`Not enough bytes at offset ${offset}`);
      break;
    }
    
    const chunkId = String.fromCharCode(...new Uint8Array(arrayBuffer, offset, 4));
    const chunkSize = buffer.getUint32(offset + 4, true);
    
    console.log(`Chunk ${chunkCount}: ${chunkId} at offset ${offset}, size ${chunkSize}`);
    
    if (offset + 8 + chunkSize > buffer.byteLength) {
      console.warn(`Chunk extends beyond file boundary`);
      break;
    }
    
    if (chunkId === 'fmt ') {
      if (offset + 24 <= buffer.byteLength) {
        const audioFormat = buffer.getUint16(offset + 8, true);
        const channels = buffer.getUint16(offset + 10, true);
        const sampleRate = buffer.getUint32(offset + 12, true);
        const bitsPerSample = buffer.getUint16(offset + 22, true);
        
        console.log(`  Audio format: ${audioFormat}`);
        console.log(`  Channels: ${channels}`);
        console.log(`  Sample rate: ${sampleRate}`);
        console.log(`  Bits per sample: ${bitsPerSample}`);
      }
    } else if (chunkId === 'data') {
      console.log(`  Data chunk found at offset ${offset + 8}, size ${chunkSize}`);
      console.log(`  Expected samples: ${chunkSize / 2}`);
    }
    
    offset += 8 + chunkSize;
    if (chunkSize % 2 === 1) {
      offset++;
    }
    
    chunkCount++;
  }
  
  console.log('=== End Debug ===');
} 