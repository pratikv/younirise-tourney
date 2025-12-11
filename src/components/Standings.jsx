import './Standings.css';

function Standings({ tournament }) {
  const groupAStandings = tournament.getStandings('A');
  const groupBStandings = tournament.getStandings('B');
  const overallRankings = tournament.getOverallRankings();
  const top4A = tournament.getTop4('A');
  const top4B = tournament.getTop4('B');

  return (
    <div className="standings">
      <div className="standings-section">
        <h2>Group A Standings</h2>
        <div className="standings-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Total Matches</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Games Won</th>
                <th>Games Lost</th>
                <th>Total Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {groupAStandings.map((standing, index) => {
                const totalMatches = standing.wins + standing.losses;
                const totalPoints = standing.wins * 2;
                return (
                  <tr 
                    key={standing.player.id}
                    className={top4A.includes(standing.player) ? 'qualified' : ''}
                  >
                    <td>{index + 1}</td>
                    <td>{standing.player.name}</td>
                    <td>{totalMatches}</td>
                    <td>{standing.wins}</td>
                    <td>{standing.losses}</td>
                    <td>{standing.gamesWon}</td>
                    <td>{standing.gamesLost}</td>
                    <td>{totalPoints}</td>
                    <td>
                      {top4A.includes(standing.player) && (
                        <span className="qualified-badge">Qualified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {groupAStandings.length === 0 && (
            <p className="empty-message">No players in Group A</p>
          )}
        </div>
      </div>

      <div className="standings-section">
        <h2>Group B Standings</h2>
        <div className="standings-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Total Matches</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Games Won</th>
                <th>Games Lost</th>
                <th>Total Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {groupBStandings.map((standing, index) => {
                const totalMatches = standing.wins + standing.losses;
                const totalPoints = standing.wins * 2;
                return (
                  <tr 
                    key={standing.player.id}
                    className={top4B.includes(standing.player) ? 'qualified' : ''}
                  >
                    <td>{index + 1}</td>
                    <td>{standing.player.name}</td>
                    <td>{totalMatches}</td>
                    <td>{standing.wins}</td>
                    <td>{standing.losses}</td>
                    <td>{standing.gamesWon}</td>
                    <td>{standing.gamesLost}</td>
                    <td>{totalPoints}</td>
                    <td>
                      {top4B.includes(standing.player) && (
                        <span className="qualified-badge">Qualified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {groupBStandings.length === 0 && (
            <p className="empty-message">No players in Group B</p>
          )}
        </div>
      </div>

      <div className="standings-section">
        <h2>Overall Rankings (All Players)</h2>
        <div className="standings-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Group</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Games Won</th>
                <th>Games Lost</th>
              </tr>
            </thead>
            <tbody>
              {overallRankings.map((standing) => (
                <tr key={standing.player.id}>
                  <td>{standing.overallRank}</td>
                  <td>{standing.player.name}</td>
                  <td>{standing.player.group}</td>
                  <td>{standing.wins}</td>
                  <td>{standing.losses}</td>
                  <td>{standing.gamesWon}</td>
                  <td>{standing.gamesLost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {overallRankings.length === 0 && (
            <p className="empty-message">No players yet</p>
          )}
        </div>
      </div>

      <div className="super8-section">
        <h2>Super 8 Qualifiers</h2>
        <div className="qualifiers-grid">
          <div className="qualifiers-group">
            <h3>From Group A</h3>
            <ul>
              {top4A.map((player, index) => (
                <li key={player.id}>{index + 1}. {player.name}</li>
              ))}
              {top4A.length === 0 && <li className="empty">No qualifiers yet</li>}
            </ul>
          </div>
          <div className="qualifiers-group">
            <h3>From Group B</h3>
            <ul>
              {top4B.map((player, index) => (
                <li key={player.id}>{index + 1}. {player.name}</li>
              ))}
              {top4B.length === 0 && <li className="empty">No qualifiers yet</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Standings;

