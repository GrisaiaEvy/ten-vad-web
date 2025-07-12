import React from 'react';
import './ResultsDisplay.css';

export default function ResultsDisplay({ results }) {
  if (!results) {
    return null;
  }

  return (
    <section className="results">
      <h3>Processing Results</h3>
      <div className="results-summary">
        <div className="summary-item">
          <strong>Processing Time:</strong> {results.processingTime}ms
        </div>
        <div className="summary-item">
          <strong>Audio Duration:</strong> {results.totalAudioTime.toFixed(2)}ms
        </div>
        <div className="summary-item">
          <strong>Real-time Factor:</strong> {results.rtf.toFixed(3)}
        </div>
        <div className="summary-item">
          <strong>Voice Frames:</strong> {results.voiceFrames}/{results.frameNum} ({results.voicePercentage}%)
        </div>
        <div className="summary-item">
          <strong>Voice Segments:</strong> {results.voiceSegments.length}
        </div>
      </div>

      <div className="voice-segments">
        <h4>Voice Segments</h4>
        {results.voiceSegments.length > 0 ? (
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
                {results.voiceSegments.map((segment, index) => (
                  <tr key={index} className="voice-segment">
                    <td>{index + 1}</td>
                    <td>{segment.startTime.toFixed(1)}ms</td>
                    <td>{segment.endTime.toFixed(1)}ms</td>
                    <td>{segment.duration.toFixed(1)}ms</td>
                    <td>{segment.startFrame}-{segment.endFrame}</td>
                    <td>{segment.avgProbability.toFixed(4)}</td>
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