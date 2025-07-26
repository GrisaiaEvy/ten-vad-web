# Ten VAD Web

A web application for Voice Activity Detection (VAD) using the Ten VAD Library.

## Features

- 🎤 Real-time voice activity detection
- 📁 Audio file upload and processing
- 📊 Detailed processing results and statistics
- 🎵 Audio player with voice segment visualization
- ⚡ Fast processing using WebAssembly

## Technology Stack

- **React 19** - Modern React with hooks
- **Ten VAD Library** - Real VAD processing using WebAssembly
- **WaveSurfer.js** - Audio visualization
- **WebAssembly** - High-performance audio processing

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

```bash
npm run build
```

The build output will be in the `build/` directory.

## Usage

1. **Upload Audio File**: Click the upload area to select an audio file (WAV format recommended)
2. **Processing**: The application will automatically process the audio using the Ten VAD Library
3. **Results**: View detailed processing results including:
   - Speech segments with timestamps
   - Processing statistics
   - Real-time factor
   - Voice percentage

## VAD Library Integration

This application uses the published `ten-vad-lib` npm package for voice activity detection:

```javascript
import { NonRealTimeTenVAD } from 'ten-vad-lib';

const vad = await NonRealTimeTenVAD.new({
  hopSize: 256,
  voiceThreshold: 0.5,
  minSpeechDuration: 100,
  wasmPath: '/wasm/ten_vad.wasm',
  jsPath: '/wasm/ten_vad.js'
});

const result = await vad.process(audioData, sampleRate);
```

## WASM Files

The application includes the necessary WebAssembly files in the `public/wasm/` directory:
- `ten_vad.wasm` - The compiled VAD model
- `ten_vad.js` - JavaScript interface for the WASM module

## Browser Support

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 79+

## License

MIT
