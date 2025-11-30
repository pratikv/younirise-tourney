import { useState } from 'react';
import './MatchResults.css';

function MatchResults({ tournament, onRecordResult, isEditable = false }) {
  const [editingMatch, setEditingMatch] = useState(null);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [error, setError] = useState('');

  const getPlayerName = (playerId) => {
    const player = tournament.players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  const handleRecordResult = (match) => {
    setEditingMatch(match);
    setPlayer1Score(match.player1Score || '');
    setPlayer2Score(match.player2Score || '');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const p1Score = parseInt(player1Score);
      const p2Score = parseInt(player2Score);
      
      if (isNaN(p1Score) || isNaN(p2Score)) {
        throw new Error('Scores must be numbers');
      }

      onRecordResult(editingMatch.id, p1Score, p2Score);
      setEditingMatch(null);
      setPlayer1Score('');
      setPlayer2Score('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getMatchesByGroup = (group) => {
    const matches = tournament.matches.filter(m => m.group === group);
    
    // Remove duplicates - keep only unique matches between the same players
    const uniqueMatches = [];
    const seenKeys = new Set();
    
    matches.forEach(match => {
      // Create a normalized key for the match (sorted player IDs)
      const playerIds = [match.player1Id, match.player2Id].sort();
      const matchKey = `${playerIds[0]}-${playerIds[1]}`;
      
      if (!seenKeys.has(matchKey)) {
        seenKeys.add(matchKey);
        uniqueMatches.push(match);
      } else {
        // If duplicate found, prefer the one that's completed or has a result
        const existingIndex = uniqueMatches.findIndex(existing => {
          const existingIds = [existing.player1Id, existing.player2Id].sort();
          return `${existingIds[0]}-${existingIds[1]}` === matchKey;
        });
        
        if (existingIndex !== -1) {
          const existing = uniqueMatches[existingIndex];
          // Prefer completed matches, or if both are same status, prefer the one with later ID (more recent)
          if (match.completed && !existing.completed) {
            uniqueMatches[existingIndex] = match;
          } else if (match.completed === existing.completed && match.id > existing.id) {
            uniqueMatches[existingIndex] = match;
          }
        }
      }
    });
    
    // Sort: completed matches by date (most recent first), then pending matches
    return uniqueMatches.sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      if (a.completed && b.completed) {
        // Both completed, sort by date (most recent first)
        if (!a.playedAt && !b.playedAt) return 0;
        if (!a.playedAt) return 1;
        if (!b.playedAt) return -1;
        return new Date(b.playedAt) - new Date(a.playedAt);
      }
      return 0; // Both pending, keep original order
    });
  };

  const formatMatchDate = (playedAt) => {
    if (!playedAt) return null;
    try {
      const date = new Date(playedAt);
      const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="match-results">
      <div className="matches-section">
        <div className="group-matches">
          <h2>Group A Matches</h2>
          {getMatchesByGroup('A').length === 0 ? (
            <p className="empty-message">No matches yet. Add players to generate matches.</p>
          ) : (
            <div className="matches-list">
              {getMatchesByGroup('A').map(match => (
                <div key={match.id} className={`match-card ${match.completed ? 'completed' : 'pending'}`}>
                  <div className="match-players">
                    <span className={match.winnerId === match.player1Id ? 'winner' : ''}>
                      {getPlayerName(match.player1Id)}
                    </span>
                    <span className="vs">vs</span>
                    <span className={match.winnerId === match.player2Id ? 'winner' : ''}>
                      {getPlayerName(match.player2Id)}
                    </span>
                  </div>
                  {match.completed ? (
                    <div className="match-score">
                      <span className="score">{match.player1Score}</span>
                      <span className="separator">-</span>
                      <span className="score">{match.player2Score}</span>
                    </div>
                  ) : (
                    isEditable ? (
                      <button 
                        onClick={() => handleRecordResult(match)}
                        className="record-btn"
                      >
                        Record Result
                      </button>
                    ) : (
                      <div className="pending-match-label">Pending</div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="group-matches">
          <h2>Group B Matches</h2>
          {getMatchesByGroup('B').length === 0 ? (
            <p className="empty-message">No matches yet. Add players to generate matches.</p>
          ) : (
            <div className="matches-list">
              {getMatchesByGroup('B').map(match => (
                <div key={match.id} className={`match-card ${match.completed ? 'completed' : 'pending'}`}>
                  <div className="match-players">
                    <span className={match.winnerId === match.player1Id ? 'winner' : ''}>
                      {getPlayerName(match.player1Id)}
                    </span>
                    <span className="vs">vs</span>
                    <span className={match.winnerId === match.player2Id ? 'winner' : ''}>
                      {getPlayerName(match.player2Id)}
                    </span>
                  </div>
                  {match.completed ? (
                    <div className="match-score">
                      <span className="score">{match.player1Score}</span>
                      <span className="separator">-</span>
                      <span className="score">{match.player2Score}</span>
                    </div>
                  ) : (
                    isEditable ? (
                      <button 
                        onClick={() => handleRecordResult(match)}
                        className="record-btn"
                      >
                        Record Result
                      </button>
                    ) : (
                      <div className="pending-match-label">Pending</div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingMatch && (
        <div className="modal-overlay" onClick={() => setEditingMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Record Match Result</h3>
            <p className="match-info">
              {getPlayerName(editingMatch.player1Id)} vs {getPlayerName(editingMatch.player2Id)}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="score-inputs">
                <div className="score-input-group">
                  <label>{getPlayerName(editingMatch.player1Id)}</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={player1Score}
                    onChange={(e) => setPlayer1Score(e.target.value)}
                    required
                  />
                </div>
                <span className="vs">vs</span>
                <div className="score-input-group">
                  <label>{getPlayerName(editingMatch.player2Id)}</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={player2Score}
                    onChange={(e) => setPlayer2Score(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button type="submit">Save Result</button>
                <button type="button" onClick={() => setEditingMatch(null)}>Cancel</button>
              </div>
            </form>
            <p className="help-text">
              Best of 15 games. Winner must have at least 8 games. 
              Tie break required if score is 7-7.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchResults;

