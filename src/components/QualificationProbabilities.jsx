import './QualificationProbabilities.css';

function QualificationProbabilities({ tournament }) {
  const groupAStandings = tournament.getStandings('A');
  const groupBStandings = tournament.getStandings('B');

  const getProbability = (playerId, group) => {
    return tournament.calculateQualificationProbability(playerId, group);
  };

  const getRemainingMatches = (playerId, group) => {
    return tournament.matches.filter(m => 
      m.group === group && 
      !m.completed && 
      (m.player1Id === playerId || m.player2Id === playerId)
    ).length;
  };

  return (
    <div className="qualification-probabilities">
      <div className="probabilities-section">
        <h2>Group A - Qualification Chances</h2>
        <p className="section-description">
          Probability of qualifying for Super 8 (Top 4)
        </p>
        <div className="probabilities-list">
          {groupAStandings.map((standing, index) => {
            const probability = getProbability(standing.player.id, 'A');
            const remainingMatches = getRemainingMatches(standing.player.id, 'A');
            const isQualified = index < 4;

            return (
              <div 
                key={standing.player.id} 
                className={`probability-card ${isQualified ? 'qualified' : ''}`}
              >
                <div className="player-info">
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{standing.player.name}</span>
                </div>
                <div className="stats">
                  <div className="stat">
                    <span className="label">Record:</span>
                    <span className="value">{standing.wins}W - {standing.losses}L</span>
                  </div>
                  <div className="stat">
                    <span className="label">Remaining Matches:</span>
                    <span className="value">{remainingMatches}</span>
                  </div>
                </div>
                <div className="probability-bar-container">
                  <div className="probability-info">
                    <span className="probability-label">Qualification Chance</span>
                    <span className="probability-value">{isQualified ? '100%' : `${Math.round(probability)}%`}</span>
                  </div>
                  <div className="probability-bar">
                    <div 
                      className="probability-fill"
                      style={{ width: `${isQualified ? 100 : probability}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {groupAStandings.length === 0 && (
            <p className="empty-message">No players in Group A</p>
          )}
        </div>
      </div>

      <div className="probabilities-section">
        <h2>Group B - Qualification Chances</h2>
        <p className="section-description">
          Probability of qualifying for Super 8 (Top 4)
        </p>
        <div className="probabilities-list">
          {groupBStandings.map((standing, index) => {
            const probability = getProbability(standing.player.id, 'B');
            const remainingMatches = getRemainingMatches(standing.player.id, 'B');
            const isQualified = index < 4;

            return (
              <div 
                key={standing.player.id} 
                className={`probability-card ${isQualified ? 'qualified' : ''}`}
              >
                <div className="player-info">
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{standing.player.name}</span>
                </div>
                <div className="stats">
                  <div className="stat">
                    <span className="label">Record:</span>
                    <span className="value">{standing.wins}W - {standing.losses}L</span>
                  </div>
                  <div className="stat">
                    <span className="label">Remaining Matches:</span>
                    <span className="value">{remainingMatches}</span>
                  </div>
                </div>
                <div className="probability-bar-container">
                  <div className="probability-info">
                    <span className="probability-label">Qualification Chance</span>
                    <span className="probability-value">{isQualified ? '100%' : `${Math.round(probability)}%`}</span>
                  </div>
                  <div className="probability-bar">
                    <div 
                      className="probability-fill"
                      style={{ width: `${isQualified ? 100 : probability}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {groupBStandings.length === 0 && (
            <p className="empty-message">No players in Group B</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QualificationProbabilities;

