import { useState } from 'react';
import './Standings.css';

function Standings({ tournament }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const groupAStandings = tournament.getStandings('A');
  const groupBStandings = tournament.getStandings('B');
  const overallRankings = tournament.getOverallRankings();
  const top4A = tournament.getTop4('A');
  const top4B = tournament.getTop4('B');

  const getMatchupsForPlayer = (player) => {
    const groupPlayers = tournament.groups[player.group] || [];
    const groupMatches = tournament.matches.filter(m => m.group === player.group);

    const opponentMatchups = groupPlayers
      .filter(p => p.id !== player.id)
      .map(opponent => {
        const matches = groupMatches.filter(m => (
          (m.player1Id === player.id && m.player2Id === opponent.id) ||
          (m.player1Id === opponent.id && m.player2Id === player.id)
        ));

        if (matches.length === 0) {
          return {
            opponent,
            wins: 0,
            losses: 0,
            scores: [],
            status: 'Not scheduled'
          };
        }

        const completedMatches = matches.filter(m => m.completed);
        if (completedMatches.length === 0) {
          return {
            opponent,
            wins: 0,
            losses: 0,
            scores: [],
            status: 'Not played'
          };
        }

        const orderedCompleted = [...completedMatches].sort((a, b) => {
          if (a.playedAt && b.playedAt) {
            return new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime();
          }
          if (a.playedAt) return -1;
          if (b.playedAt) return 1;
          return 0;
        });

        let wins = 0;
        let losses = 0;
        const scoreLines = orderedCompleted.map(match => {
          const playerScore = match.player1Id === player.id ? match.player1Score : match.player2Score;
          const opponentScore = match.player1Id === player.id ? match.player2Score : match.player1Score;
          if (playerScore > opponentScore) {
            wins += 1;
          } else {
            losses += 1;
          }
          return `${playerScore}-${opponentScore}`;
        });

        return {
          opponent,
          wins,
          losses,
          scores: scoreLines,
          status: 'Played'
        };
      });

    const winningOpponents = opponentMatchups
      .filter(matchup => matchup.wins > matchup.losses)
      .sort((a, b) => a.opponent.name.localeCompare(b.opponent.name));
    const losingOpponents = opponentMatchups
      .filter(matchup => matchup.losses > matchup.wins)
      .sort((a, b) => a.opponent.name.localeCompare(b.opponent.name));
    const noResultOpponents = opponentMatchups
      .filter(matchup => matchup.wins === 0 && matchup.losses === 0)
      .sort((a, b) => a.opponent.name.localeCompare(b.opponent.name));

    return { winningOpponents, losingOpponents, noResultOpponents };
  };

  const handlePlayerClick = (event, player) => {
    event.preventDefault();
    setSelectedPlayer(player);
  };

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
                    <td>
                      <a
                        href="#"
                        className="player-link"
                        onClick={(event) => handlePlayerClick(event, standing.player)}
                      >
                        {standing.player.name}
                      </a>
                    </td>
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
                    <td>
                      <a
                        href="#"
                        className="player-link"
                        onClick={(event) => handlePlayerClick(event, standing.player)}
                      >
                        {standing.player.name}
                      </a>
                    </td>
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

      {selectedPlayer && (() => {
        const { winningOpponents, losingOpponents, noResultOpponents } = getMatchupsForPlayer(selectedPlayer);
        return (
        <div
          className="standings-popup-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPlayer(null);
            }
          }}
        >
          <div className="standings-popup">
            <div className="standings-popup-header">
              <div>
                <h3>{selectedPlayer.name}</h3>
                <p>Group {selectedPlayer.group} matchup results</p>
              </div>
              <button
                type="button"
                className="standings-popup-close"
                onClick={() => setSelectedPlayer(null)}
              >
                Close
              </button>
            </div>
            <div className="standings-popup-body">
              {winningOpponents.length > 0 && (
                <>
                  <h4 className="standings-popup-section-title">Won Against</h4>
                  <table className="standings-popup-table">
                    <thead>
                      <tr>
                        <th>Opponent</th>
                        <th>Scores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winningOpponents.map(matchup => (
                        <tr key={matchup.opponent.id}>
                          <td>{matchup.opponent.name}</td>
                          <td>{matchup.scores.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {losingOpponents.length > 0 && (
                <>
                  <h4 className="standings-popup-section-title">Lost Against</h4>
                  <table className="standings-popup-table">
                    <thead>
                      <tr>
                        <th>Opponent</th>
                        <th>Scores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {losingOpponents.map(matchup => (
                        <tr key={matchup.opponent.id}>
                          <td>{matchup.opponent.name}</td>
                          <td>{matchup.scores.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {noResultOpponents.length > 0 && (
                <>
                  <h4 className="standings-popup-section-title">Not Played</h4>
                  <table className="standings-popup-table">
                    <thead>
                      <tr>
                        <th>Opponent</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {noResultOpponents.map(matchup => (
                        <tr key={matchup.opponent.id}>
                          <td>{matchup.opponent.name}</td>
                          <td>{matchup.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {winningOpponents.length === 0 && losingOpponents.length === 0 && noResultOpponents.length === 0 && (
                <p className="empty-message">No opponents yet</p>
              )}
            </div>
          </div>
        </div>
        );
      })()}

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

