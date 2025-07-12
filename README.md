# TEN VAD Web Demo

A Voice Activity Detection (VAD) web application built with React and WebAssembly.

## Features

- 🎵 Upload WAV audio files for voice detection
- ⚡ High-performance audio processing using WebAssembly
- 📊 Real-time display of processing results and statistics
- 📱 Responsive design with mobile support
- 💾 Download processing results

## Tech Stack

- **Frontend Framework**: React 18
- **WebAssembly**: TEN VAD module
- **Styling**: CSS3 + Responsive design
- **Build Tool**: Create React App

## Installation and Setup

### Prerequisites

1. Ensure you have `ten_vad.js` and `ten_vad.wasm` files
2. Place these files in the `public/wasm/` directory

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

The application will start at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

## Usage

1. **Upload Audio File**: Click "Choose WAV File" button to select a WAV file
2. **View File Info**: The system will display basic information about the audio file
3. **Process Audio**: Voice activity detection will be performed automatically
4. **View Results**: 
   - Processing time statistics
   - Number and percentage of voice frames
   - Frame-by-frame detection results
5. **Download Results**: Click "Download Results" to download detailed results

## Supported Audio Formats

- **Format**: WAV (PCM)
- **Sample Rate**: 16kHz (recommended)
- **Bit Depth**: 16-bit
- **Channels**: Mono (recommended) / Stereo (automatically converted to mono)

## Project Structure

```
ten-vad-web/
├── public/
│   └── wasm/
│       ├── ten_vad.js      # WASM module loader
│       └── ten_vad.wasm    # WASM binary file
├── src/
│   ├── components/
│   │   ├── VadApp.jsx      # Main application component
│   │   └── VadApp.css      # Component styles
│   ├── utils/
│   │   └── wavParser.js    # WAV file parsing utilities
│   ├── wasm/
│   │   └── useVadModule.js # WASM module loading Hook
│   ├── App.js              # Application entry point
│   └── App.css             # Application styles
└── README.md
```

## Configuration

### VAD Parameters

You can adjust the following parameters in `src/components/VadApp.jsx`:

```javascript
const HOP_SIZE = 256;          // Frame size (16ms @ 16kHz)
const VOICE_THRESHOLD = 0.5;   // Voice detection threshold
```

### File Size Limits

By default, browsers don't have strict file upload limits, but we recommend:

- Audio file size < 50MB
- Audio duration < 10 minutes

## Troubleshooting

### WASM Module Loading Failure

1. Check if the correct files exist in `public/wasm/` directory
2. Ensure file names are correct: `ten_vad.js` and `ten_vad.wasm`
3. Check browser console for error messages

### Audio File Parsing Failure

1. Ensure you're uploading a valid WAV file
2. Check if the audio format meets the requirements
3. Try re-exporting the audio as 16kHz 16-bit PCM WAV using audio editing software

### Performance Issues

1. For large files, processing may take some time
2. Consider splitting long audio files into segments
3. Ensure browser supports WebAssembly

## Development Notes

### Adding New Features

1. **Recording Feature**: Can implement real-time recording using Web Audio API
2. **Waveform Display**: Can add audio waveform visualization
3. **Batch Processing**: Support processing multiple files simultaneously
4. **Result Visualization**: Add charts to display detection results

## License

This project is open source under Apache License 2.0.

## Contributing

Issues and Pull Requests are welcome!

## Related Links

- [TEN Framework](https://github.com/agora/TEN)
- [React Documentation](https://reactjs.org/)
- [WebAssembly Documentation](https://webassembly.org/)
