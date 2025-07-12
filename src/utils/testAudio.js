// Generate test WAV file
export function generateTestWav(durationMs = 5000) {
  const sampleRate = 16000;
  const channels = 1;
  const bitsPerSample = 16;
  const totalSamples = Math.floor(durationMs * sampleRate / 1000);
  
  // Generate audio data
  const audioData = new Int16Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    if (t < 0.5) {
      // Silence
      sample = Math.random() * 50;
    } else if (t < 1.5) {
      // First voice segment (440Hz + 880Hz)
      sample = Math.sin(2 * Math.PI * 440 * t) * 8000 +
               Math.sin(2 * Math.PI * 880 * t) * 4000;
    } else if (t < 2.0) {
      // Silence
      sample = Math.random() * 50;
    } else if (t < 2.8) {
      // Second voice segment (220Hz + 660Hz)
      sample = Math.sin(2 * Math.PI * 220 * t) * 6000 + 
               Math.sin(2 * Math.PI * 660 * t) * 3000;
    } else {
      // Silence
      sample = Math.random() * 50;
    }
    
    audioData[i] = Math.max(-32768, Math.min(32767, Math.floor(sample)));
  }
  
  // Create WAV file
  const dataSize = audioData.length * 2; // 16-bit = 2 bytes per sample
  const fileSize = 36 + dataSize; // 44 bytes header - 8 bytes for RIFF header
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  // WAV file header
  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, fileSize, true);    // File size
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // fmt chunk
  view.setUint32(12, 0x666D7420, false); // "fmt "
  view.setUint32(16, 16, true);          // fmt chunk size
  view.setUint16(20, 1, true);           // Audio format (PCM)
  view.setUint16(22, channels, true);    // Channels
  view.setUint32(24, sampleRate, true);  // Sample rate
  view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // Byte rate
  view.setUint16(32, channels * bitsPerSample / 8, true); // Block align
  view.setUint16(34, bitsPerSample, true);
  
  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);    // Data size
  
  // Copy audio data
  const audioView = new Int16Array(buffer, 44);
  audioView.set(audioData);
  
  return buffer;
}

// Create test WAV file as File object
export function createTestWavFile(durationMs = 5000, filename = 'test_audio.wav') {
  const buffer = generateTestWav(durationMs);
  const blob = new Blob([buffer], { type: 'audio/wav' });
  
  return new File([blob], filename, { type: 'audio/wav' });
} 