import { useState } from 'react';
import './PlayerManagement.css';

function PlayerManagement({ tournament, onAddPlayer, onRemovePlayer, isEditable = false }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('A');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onAddPlayer(playerName.trim(), selectedGroup);
      setPlayerName('');
    }
  };

  return (
    <div className="player-management">
      {isEditable && (
        <div className="add-player-section">
          <h2>Add Player</h2>
          <form onSubmit={handleAddPlayer} className="add-player-form">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Player name"
              required
            />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="A">Group A</option>
              <option value="B">Group B</option>
            </select>
            <button type="submit">Add Player</button>
          </form>
        </div>
      )}

      <div className="players-list">
        <div className="group-section">
          <h2>Group A ({tournament.groups.A.length} players)</h2>
          <div className="players-grid">
            {tournament.groups.A.map(player => (
              <div key={player.id} className="player-card">
                <span>{player.name}</span>
                {isEditable && (
                  <button 
                    onClick={() => onRemovePlayer(player.id)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {tournament.groups.A.length === 0 && (
              <p className="empty-message">No players in Group A</p>
            )}
          </div>
        </div>

        <div className="group-section">
          <h2>Group B ({tournament.groups.B.length} players)</h2>
          <div className="players-grid">
            {tournament.groups.B.map(player => (
              <div key={player.id} className="player-card">
                <span>{player.name}</span>
                {isEditable && (
                  <button 
                    onClick={() => onRemovePlayer(player.id)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {tournament.groups.B.length === 0 && (
              <p className="empty-message">No players in Group B</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerManagement;

