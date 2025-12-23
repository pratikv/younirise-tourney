import { useState, useEffect } from 'react';
import { Tournament, Match } from './utils/tournament';
import { deserializeTournament } from './utils/dataSerializer';
import PlayerManagement from './components/PlayerManagement';
import MatchResults from './components/MatchResults';
import Standings from './components/Standings';
import QualificationProbabilities from './components/QualificationProbabilities';
import DataManagement from './components/DataManagement';
import KnockoutStage from './components/KnockoutStage';
import preloadData from './assets/data.json';
import './App.css';

function App() {
  const [tournament, setTournament] = useState(() => {
    // First try to load from localStorage
    const saved = localStorage.getItem('tournament');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const t = new Tournament();
        // Reconstruct tournament from saved data
        data.players.forEach(p => {
          t.players.push(p);
          t.groups[p.group].push(p);
        });
        data.matches.forEach(m => {
          const match = new Match(m.id, m.player1Id, m.player2Id, m.group);
          match.player1Score = m.player1Score;
          match.player2Score = m.player2Score;
          match.winnerId = m.winnerId;
          match.completed = m.completed;
          match.playedAt = m.playedAt || null; // Handle old data without playedAt
          t.matches.push(match);
        });
        return t;
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
    
    // If no localStorage data, load from preload data
    try {
      return deserializeTournament(preloadData);
    } catch (error) {
      console.error('Error loading preload data:', error);
      return new Tournament();
    }
  });

  const [activeTab, setActiveTab] = useState('players');

  // Check if editing is enabled via URL query parameter
  const [isEditable, setIsEditable] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('editable') === 'true';
  });

  // Save tournament state to localStorage (only if editable)
  useEffect(() => {
    if (!isEditable) return; // Don't save if not editable
    const data = {
      players: tournament.players,
      matches: tournament.matches.map(m => ({
        id: m.id,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        group: m.group,
        player1Score: m.player1Score,
        player2Score: m.player2Score,
        winnerId: m.winnerId,
        completed: m.completed,
        playedAt: m.playedAt
      }))
    };
    localStorage.setItem('tournament', JSON.stringify(data));
  }, [tournament, isEditable]);

  const addPlayer = (name, group) => {
    if (!isEditable) return;
    const newTournament = new Tournament();
    newTournament.players = [...tournament.players];
    newTournament.matches = [...tournament.matches];
    newTournament.groups = {
      A: [...tournament.groups.A],
      B: [...tournament.groups.B]
    };
    newTournament.addPlayer(name, group);
    setTournament(newTournament);
  };

  const removePlayer = (playerId) => {
    if (!isEditable) return;
    const newTournament = new Tournament();
    newTournament.players = [...tournament.players];
    newTournament.matches = [...tournament.matches];
    newTournament.groups = {
      A: [...tournament.groups.A],
      B: [...tournament.groups.B]
    };
    newTournament.removePlayer(playerId);
    setTournament(newTournament);
  };

  const recordMatchResult = (matchId, player1Score, player2Score) => {
    if (!isEditable) return;
    const newTournament = new Tournament();
    newTournament.players = [...tournament.players];
    newTournament.matches = tournament.matches.map(m => {
      if (m.id === matchId) {
        const newMatch = Object.assign(Object.create(Object.getPrototypeOf(m)), m);
        newMatch.recordResult(player1Score, player2Score);
        return newMatch;
      }
      return m;
    });
    newTournament.groups = {
      A: [...tournament.groups.A],
      B: [...tournament.groups.B]
    };
    setTournament(newTournament);
  };

  const handleImportTournament = (importedTournament) => {
    if (!isEditable) return;
    setTournament(importedTournament);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏆 Younirise Tourney 2025-26</h1>
        <p>Best of 15 Games • Tie Break at 7-7 • Top 4 to Super 8</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={activeTab === 'players' ? 'active' : ''}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button 
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button 
          className={activeTab === 'standings' ? 'active' : ''}
          onClick={() => setActiveTab('standings')}
        >
          Standings
        </button>
        <button 
          className={activeTab === 'knockout' ? 'active' : ''}
          onClick={() => setActiveTab('knockout')}
        >
          Knockout Stage
        </button>
        {isEditable && (
          <button 
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            Data Management
          </button>
        )}
      </nav>

      <main className="app-content">
        {activeTab === 'players' && (
          <PlayerManagement
            tournament={tournament}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            isEditable={isEditable}
          />
        )}
        {activeTab === 'matches' && (
          <MatchResults
            tournament={tournament}
            onRecordResult={recordMatchResult}
            isEditable={isEditable}
          />
        )}
        {activeTab === 'standings' && (
          <Standings tournament={tournament} />
        )}
        {activeTab === 'knockout' && (
          <KnockoutStage tournament={tournament} />
        )}
        {activeTab === 'probabilities' && (
          <QualificationProbabilities tournament={tournament} />
        )}
        {activeTab === 'data' && (
          <DataManagement
            tournament={tournament}
            onImportTournament={handleImportTournament}
            isEditable={isEditable}
          />
        )}
      </main>
    </div>
  );
}

export default App;

