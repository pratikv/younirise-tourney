// Utility functions for serializing and deserializing tournament data

import { Tournament, Match } from './tournament';

/**
 * Serialize tournament data to JSON format
 */
export function serializeTournament(tournament) {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    players: tournament.players.map(p => ({
      id: p.id,
      name: p.name,
      group: p.group
    })),
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
}

/**
 * Deserialize tournament data from JSON format
 */
export function deserializeTournament(jsonData) {
  try {
    // Handle both old format (without version) and new format
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    const tournament = new Tournament();
    
    // Reconstruct players
    if (data.players && Array.isArray(data.players)) {
      data.players.forEach(p => {
        tournament.players.push(p);
        if (p.group === 'A' || p.group === 'B') {
          tournament.groups[p.group].push(p);
        }
      });
    }
    
    // Reconstruct matches
    if (data.matches && Array.isArray(data.matches)) {
      data.matches.forEach(m => {
        const match = new Match(m.id, m.player1Id, m.player2Id, m.group);
        match.player1Score = m.player1Score;
        match.player2Score = m.player2Score;
        match.winnerId = m.winnerId;
        match.completed = m.completed;
        match.playedAt = m.playedAt || null; // Handle old data without playedAt
        tournament.matches.push(match);
      });
    }
    
    return tournament;
  } catch (error) {
    throw new Error(`Failed to deserialize tournament data: ${error.message}`);
  }
}

/**
 * Export tournament data to JSON file
 */
export function exportToJSON(tournament, filename = 'tournament-data.json') {
  const data = serializeTournament(tournament);
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import tournament data from JSON file
 */
export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const tournament = deserializeTournament(e.target.result);
        resolve(tournament);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

