import React from 'react';
import './ResultsDisplay.css';

export default function ResultsDisplay({ results }) {
  if (!results) {
    return null;
  }

  // 安全地获取值，提供默认值
  const getSafeValue = (obj, path, defaultValue = 0) => {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    return value !== undefined && value !== null ? value : defaultValue;
  };

  const processingTime = getSafeValue(results, 'statistics.processingTime', 0);
  const totalAudioTime = getSafeValue(results, 'statistics.totalAudioTime', 0);
  const rtf = getSafeValue(results, 'statistics.realTimeFactor', 0);
  const voiceFrames = getSafeValue(results, 'statistics.voiceFrames', 0);
  const totalFrames = getSafeValue(results, 'statistics.totalFrames', 0);
  const voicePercentage = getSafeValue(results, 'statistics.voicePercentage', 0);
  const speechSegments = getSafeValue(results, 'speechSegments', []);

  return (
    <section className="results">
      <h3>Processing Results</h3>
      <div className="results-summary">
        <div className="summary-item">
          <strong>Processing Time:</strong> {processingTime}ms
        </div>
        <div className="summary-item">
          <strong>Audio Duration:</strong> {totalAudioTime.toFixed(2)}ms
        </div>
        <div className="summary-item">
          <strong>Real-time Factor:</strong> {rtf.toFixed(3)}
        </div>
        <div className="summary-item">
          <strong>Voice Frames:</strong> {voiceFrames}/{totalFrames} ({voicePercentage.toFixed(1)}%)
        </div>
        <div className="summary-item">
          <strong>Voice Segments:</strong> {speechSegments.length}
        </div>
      </div>

      <div className="voice-segments">
        <h4>Voice Segments</h4>
        {speechSegments.length > 0 ? (
          <div className="segments-container">
            <table>
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Frames</th>
                  <th>Avg Probability</th>
                </tr>
              </thead>
              <tbody>
                {speechSegments.map((segment, index) => (
                  <tr key={index} className="voice-segment">
                    <td>{index + 1}</td>
                    <td>{getSafeValue(segment, 'startTime', 0).toFixed(1)}ms</td>
                    <td>{getSafeValue(segment, 'endTime', 0).toFixed(1)}ms</td>
                    <td>{getSafeValue(segment, 'duration', 0).toFixed(1)}ms</td>
                    <td>{getSafeValue(segment, 'startFrame', 0)}-{getSafeValue(segment, 'endFrame', 0)}</td>
                    <td>{getSafeValue(segment, 'avgProbability', 0).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-voice">No voice segments detected</p>
        )}
      </div>
    </section>
  );
} 