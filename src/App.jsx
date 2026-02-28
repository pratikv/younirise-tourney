import { useState, useEffect } from 'react';
import { Tournament, Match } from './utils/tournament';
import { deserializeTournament, serializeTournament } from './utils/dataSerializer';
import PlayerManagement from './components/PlayerManagement';
import MatchResults from './components/MatchResults';
import Standings from './components/Standings';
import QualificationProbabilities from './components/QualificationProbabilities';
import DataManagement from './components/DataManagement';
import KnockoutStage from './components/KnockoutStage';
import preloadData from './assets/data.json';
import './App.css';

function App() {
  const getIsEditable = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('editable') === 'true';
  };

  // Check if editing is enabled via URL query parameter
  const [isEditable] = useState(getIsEditable);

  const [tournament, setTournament] = useState(() => {
    const editable = getIsEditable();
    if (editable) {
      // Only load localStorage when editing is enabled
      const saved = localStorage.getItem('tournament');
      if (saved) {
        try {
          return deserializeTournament(saved);
        } catch (error) {
          console.error('Error loading from localStorage:', error);
        }
      }
    }

    // If no localStorage data (or not editable), load from preload data
    try {
      return deserializeTournament(preloadData);
    } catch (error) {
      console.error('Error loading preload data:', error);
      return new Tournament();
    }
  });

  const [activeTab, setActiveTab] = useState('players');

  // Save tournament state to localStorage (only if editable)
  useEffect(() => {
    if (!isEditable) return; // Don't save if not editable
    const data = serializeTournament(tournament);
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
    newTournament.knockoutMatches = { ...tournament.knockoutMatches };
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
    newTournament.knockoutMatches = { ...tournament.knockoutMatches };
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
    newTournament.knockoutMatches = { ...tournament.knockoutMatches };
    setTournament(newTournament);
  };

  const updateKnockoutMatch = (matchId, player1Id, player2Id, player1Score, player2Score, options = {}) => {
    if (!isEditable) return 'Editing is disabled.';
    const newTournament = new Tournament();
    newTournament.players = [...tournament.players];
    newTournament.matches = [...tournament.matches];
    newTournament.groups = {
      A: [...tournament.groups.A],
      B: [...tournament.groups.B]
    };
    newTournament.knockoutMatches = { ...tournament.knockoutMatches };

    if (options.sets) {
      const allEmpty = options.sets.every(set => set.p1 === '' && set.p2 === '');
      if (allEmpty) {
        delete newTournament.knockoutMatches[matchId];
        setTournament(newTournament);
        return null;
      }
      const parseScore = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
      };
      const sets = options.sets.map(set => ({
        p1: parseScore(set.p1),
        p2: parseScore(set.p2)
      }));
      const validateRegularSet = (p1, p2) => {
        if (p1 === null || p2 === null) return 'Both scores required for set.';
        if (p1 < 0 || p2 < 0) return 'Set scores cannot be negative.';
        if (p1 === 6 && p2 <= 4) return null;
        if (p2 === 6 && p1 <= 4) return null;
        if (p1 === 7 && (p2 === 5 || p2 === 6)) return null;
        if (p2 === 7 && (p1 === 5 || p1 === 6)) return null;
        return 'Invalid set score. Use regular tennis set rules.';
      };
      const validateSuperTiebreak = (p1, p2) => {
        if (p1 === null || p2 === null) return 'Both scores required for super tie break.';
        if (p1 < 0 || p2 < 0) return 'Super tie break scores cannot be negative.';
        const maxScore = Math.max(p1, p2);
        const minScore = Math.min(p1, p2);
        if (maxScore < 10) return 'Super tie break winner must reach 10.';
        if (maxScore - minScore < 2) return 'Super tie break must be won by 2.';
        return null;
      };

      const set1Error = validateRegularSet(sets[0]?.p1, sets[0]?.p2);
      if (set1Error) return set1Error;
      const set2Error = validateRegularSet(sets[1]?.p1, sets[1]?.p2);
      if (set2Error) return set2Error;

      let p1Sets = 0;
      let p2Sets = 0;
      if (sets[0].p1 > sets[0].p2) p1Sets += 1;
      else p2Sets += 1;
      if (sets[1].p1 > sets[1].p2) p1Sets += 1;
      else p2Sets += 1;

      let set3Provided = sets[2] && sets[2].p1 !== null && sets[2].p2 !== null;
      if (p1Sets === 1 && p2Sets === 1) {
        if (!set3Provided) return 'Third set super tie break is required.';
        const set3Error = validateSuperTiebreak(sets[2].p1, sets[2].p2);
        if (set3Error) return set3Error;
        if (sets[2].p1 > sets[2].p2) p1Sets += 1;
        else p2Sets += 1;
      } else if (set3Provided) {
        return 'Third set should be empty when match is decided in two sets.';
      }

      const winnerId = p1Sets > p2Sets ? player1Id : player2Id;
      newTournament.knockoutMatches[matchId] = {
        id: matchId,
        player1Id,
        player2Id,
        player1Score: p1Sets,
        player2Score: p2Sets,
        winnerId,
        completed: true,
        playedAt: new Date().toISOString(),
        sets: sets.map(set => ({ player1Score: set.p1, player2Score: set.p2 }))
      };
      setTournament(newTournament);
      return null;
    }

    if (player1Score === '' || player2Score === '' || player1Score === null || player2Score === null) {
      delete newTournament.knockoutMatches[matchId];
      setTournament(newTournament);
      return null;
    }

    try {
      const match = new Match(matchId, player1Id, player2Id, 'KO');
      match.recordResult(Number(player1Score), Number(player2Score));
      newTournament.knockoutMatches[matchId] = {
        id: matchId,
        player1Id,
        player2Id,
        player1Score: match.player1Score,
        player2Score: match.player2Score,
        winnerId: match.winnerId,
        completed: match.completed,
        playedAt: match.playedAt
      };
      setTournament(newTournament);
      return null;
    } catch (error) {
      return error.message;
    }
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
          <KnockoutStage
            tournament={tournament}
            isEditable={isEditable}
            onUpdateKnockoutMatch={updateKnockoutMatch}
          />
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

