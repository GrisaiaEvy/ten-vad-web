import React, { useRef, useEffect, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './AudioPlayer.css';

export default function AudioPlayer({ audioUrl, audioBlob, voiceSegments = [], onReady }) {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurferReady, setWavesurferReady] = useState(false);

  // Add debug info
  console.log('[AudioPlayer] Render - audioUrl:', audioUrl, 'audioBlob:', audioBlob, 'voiceSegments:', voiceSegments);

  // Cleanup function for WaveSurfer
  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        console.log('Destroying WaveSurfer...');
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
        setWavesurferReady(false);
        if (onReady) {
          onReady(false);
        }
      }
    };
  }, [onReady]);

  // 初始化 WaveSurfer 并加载音频
  useEffect(() => {
    if (waveformRef.current && (audioUrl || audioBlob)) {
      // 如果已存在，先销毁
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
        setWavesurferReady(false);
      }
      try {
        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#a78bfa',
          progressColor: '#7c3aed',
          cursorColor: '#7c3aed',
          height: 80,
          barWidth: 2,
          barGap: 1,
          cursorWidth: 1
        });

        // Add event listeners
        wavesurferRef.current.on('ready', () => {
          console.log('WaveSurfer is ready');
          setWavesurferReady(true);
          if (onReady) {
            onReady(true);
          }
        });

        wavesurferRef.current.on('play', () => {
          console.log('WaveSurfer play event');
          setIsPlaying(true);
        });

        wavesurferRef.current.on('pause', () => {
          console.log('WaveSurfer pause event');
          setIsPlaying(false);
        });

        wavesurferRef.current.on('finish', () => {
          console.log('WaveSurfer finish event');
          setIsPlaying(false);
        });

        wavesurferRef.current.on('error', (error) => {
          console.error('WaveSurfer error:', error);
        });

        wavesurferRef.current.on('loading', (perc) => {
          console.log(`WaveSurfer loading progress: ${perc}%`);
        });
        wavesurferRef.current.on('decode', () => {
          console.log('WaveSurfer decode event');
        });
        wavesurferRef.current.on('waveform-ready', () => {
          console.log('WaveSurfer waveform-ready event');
        });

        // 立即加载音频
        if (audioUrl) {
          console.log('[AudioPlayer] Using load(audioUrl)');
          wavesurferRef.current.load(audioUrl);
        } else if (audioBlob) {
          console.log('[AudioPlayer] Using loadBlob(audioBlob)');
          wavesurferRef.current.loadBlob(audioBlob);
        }

        console.log('WaveSurfer initialized and audio loading');
      } catch (error) {
        console.error('Failed to initialize WaveSurfer:', error);
      }
    }
    // 清理函数
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
        setWavesurferReady(false);
      }
    };
  }, [audioUrl, audioBlob, onReady]);

  // Draw voice segments on waveform when voiceSegments changes
  useEffect(() => {
    if (wavesurferRef.current && wavesurferReady && voiceSegments.length > 0) {
      console.log('[AudioPlayer] Drawing voice segments:', voiceSegments);
      try {
        // Clear previous markers
        const waveformElement = waveformRef.current;
        if (waveformElement) {
          const existingMarkers = waveformElement.querySelectorAll('.voice-segment-marker');
          console.log('[AudioPlayer] Removing existing markers:', existingMarkers.length);
          existingMarkers.forEach(marker => marker.remove());
        }
        // Debug: Check WaveSurfer DOM structure
        console.log('[AudioPlayer] WaveSurfer DOM structure:');
        console.log('waveformElement:', waveformElement);
        if (waveformElement) {
          console.log('waveformElement children:', waveformElement.children);
          Array.from(waveformElement.children).forEach((child, index) => {
            console.log(`Child ${index}:`, child.tagName, child.className, child.id);
          });
        }
        // Get total audio duration (seconds)
        const totalDuration = wavesurferRef.current.getDuration();
        console.log('[AudioPlayer] Total audio duration:', totalDuration, 'seconds');
        // Add region markers for each voice segment
        voiceSegments.forEach((segment, index) => {
          const startTime = segment.startTime / 1000; // Convert to seconds
          const endTime = segment.endTime / 1000; // Convert to seconds
          console.log(`[AudioPlayer] Adding region ${index + 1}: ${startTime}s - ${endTime}s (${segment.startTime}ms - ${segment.endTime}ms)`);
          // Use simple DOM elements to mark voice segments
          const waveformElement = waveformRef.current;
          if (waveformElement && totalDuration > 0) {
            const regionElement = document.createElement('div');
            regionElement.className = 'voice-segment-marker';
            regionElement.id = `voice-segment-${index}`;
            regionElement.style.position = 'absolute';
            regionElement.style.left = `${(startTime / totalDuration) * 100}%`;
            regionElement.style.width = `${((endTime - startTime) / totalDuration) * 100}%`;
            regionElement.style.height = '100%';
            regionElement.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            regionElement.style.border = '1px solid rgba(255, 0, 0, 0.6)';
            regionElement.style.pointerEvents = 'none';
            regionElement.style.zIndex = '1000';
            regionElement.style.top = '0';
            regionElement.title = `Voice Segment ${index + 1}: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`;
            console.log(`[AudioPlayer] Region ${index + 1} position: left=${(startTime / totalDuration) * 100}%, width=${((endTime - startTime) / totalDuration) * 100}%`);
            console.log(`[AudioPlayer] Creating element:`, regionElement);
            // 尝试找到WaveSurfer的canvas容器
            const canvas = waveformElement.querySelector('canvas');
            if (canvas && canvas.parentElement) {
              console.log('[AudioPlayer] Found canvas, adding to canvas parent');
              canvas.parentElement.appendChild(regionElement);
            } else {
              console.log('[AudioPlayer] No canvas found, adding to waveform element');
              waveformElement.appendChild(regionElement);
            }
            // Verify element was added
            const addedElement = waveformElement.querySelector(`#voice-segment-${index}`);
            console.log(`[AudioPlayer] Element added successfully:`, !!addedElement);
            if (addedElement) {
              console.log(`[AudioPlayer] Element styles:`, {
                left: addedElement.style.left,
                width: addedElement.style.width,
                height: addedElement.style.height,
                backgroundColor: addedElement.style.backgroundColor,
                zIndex: addedElement.style.zIndex,
                position: addedElement.style.position
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to draw voice segments:', error);
      }
    }
  }, [voiceSegments, wavesurferReady]);

  // Cleanup audio URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Play/pause control
  const togglePlayPause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  // Don't show component if no audio file
  if (!audioUrl && !audioBlob) {
    return null;
  }

  // Render logic: show waveform when audio file is available
  return (
    <section className="audio-player">
      <h3>Audio Waveform</h3>
      <div className="waveform-container">
        <div ref={waveformRef} className="waveform"></div>
        <div className="audio-controls">
          <button
            onClick={togglePlayPause}
            className="play-pause-button"
            disabled={!wavesurferReady}
            title={wavesurferReady ? 'Play/Pause' : 'WaveSurfer not ready'}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <div className="debug-info">
            <small>
              WaveSurfer: {wavesurferRef.current ? 'Initialized' : 'Not initialized'} |
              Ready: {wavesurferReady ? 'Yes' : 'No'} |
              Audio URL: {audioUrl ? 'Set' : 'Not set'} |
              Audio Blob: {audioBlob ? 'Set' : 'Not set'} |
              Voice Segments: {voiceSegments.length} |
              Duration: {wavesurferRef.current ? wavesurferRef.current.getDuration().toFixed(2) + 's' : 'N/A'}
            </small>
            {voiceSegments.length > 0 && (
              <div style={{ marginTop: '5px', fontSize: '10px' }}>
                <small>
                  Segments: {voiceSegments.map((seg, i) => 
                    `${i+1}:${seg.startTime.toFixed(0)}-${seg.endTime.toFixed(0)}ms`
                  ).join(', ')}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}