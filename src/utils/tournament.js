// Tournament data models and logic

export class Player {
  constructor(id, name, group) {
    this.id = id;
    this.name = name;
    this.group = group; // 'A' or 'B'
  }
}

export class Match {
  constructor(id, player1Id, player2Id, group) {
    this.id = id;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.group = group;
    this.player1Score = null;
    this.player2Score = null;
    this.winnerId = null;
    this.completed = false;
    this.playedAt = null; // ISO 8601 date string
  }

  recordResult(player1Score, player2Score) {
    // Best of 15 games, tie break at 7-7
    if (player1Score < 0 || player2Score < 0 || player1Score > 15 || player2Score > 15) {
      throw new Error("Invalid score. Must be between 0 and 15");
    }

    // Check if someone won (first to 8 games wins)
    const maxScore = Math.max(player1Score, player2Score);
    const minScore = Math.min(player1Score, player2Score);
    
    if(player1Score === 1 && player2Score === 1){
      // Allow this as dummy score
    }else {
    // At 7-7, tie break is played and winner gets 8-7
    if (player1Score === 7 && player2Score === 7) {
      throw new Error("At 7-7, a tie break must be played. Enter 8-7 for the winner.");
    }
    
    if (maxScore < 8) {
      throw new Error("Match not complete. Winner must have at least 8 games");
    }

    // Valid scores:
    // - 8-0 to 8-6 (normal win)
    // - 8-7 (tie break win at 7-7)
    // - 9-7, 10-8, etc. (if match continues beyond 8)
    // - Up to 15 games maximum
    
    if (maxScore === 8) {
      // Winner has 8, loser can have 0-7
      if (minScore > 7) {
        throw new Error("Invalid score. If winner has 8, loser cannot have more than 7");
      }
    } else if (maxScore > 8 && maxScore <= 15) {
      // For scores above 8, must win by at least 2 games
      if (maxScore - minScore < 2) {
        throw new Error("Invalid score. Winner must lead by at least 2 games");
      }
    } else {
      throw new Error("Invalid score. Maximum is 15 games");
    }
  }

    this.player1Score = player1Score;
    this.player2Score = player2Score;
    this.winnerId = player1Score > player2Score ? this.player1Id : this.player2Id;
    this.completed = true;
    this.playedAt = new Date().toISOString(); // Store current date and time
  }
}

export class Tournament {
  constructor() {
    this.players = [];
    this.matches = [];
    this.knockoutMatches = {};
    this.groups = {
      A: [],
      B: []
    };
  }

  addPlayer(name, group) {
    if (group !== 'A' && group !== 'B') {
      throw new Error("Group must be 'A' or 'B'");
    }
    const id = `player_${Date.now()}_${Math.random()}`;
    const player = new Player(id, name, group);
    this.players.push(player);
    this.groups[group].push(player);
    this.generateMatchesForGroup(group);
    return player;
  }

  removePlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    this.players = this.players.filter(p => p.id !== playerId);
    this.groups[player.group] = this.groups[player.group].filter(p => p.id !== playerId);
    // Remove matches involving this player
    this.matches = this.matches.filter(m => 
      m.player1Id !== playerId && m.player2Id !== playerId
    );
  }

  generateMatchesForGroup(group) {
    const groupPlayers = this.groups[group];
    
    // Create a normalized match key for checking duplicates
    const getMatchKey = (id1, id2) => {
      const sorted = [id1, id2].sort();
      return `${sorted[0]}-${sorted[1]}`;
    };
    
    const existingMatchKeys = new Set(
      this.matches
        .filter(m => m.group === group)
        .map(m => getMatchKey(m.player1Id, m.player2Id))
    );

    // Generate round-robin matches
    for (let i = 0; i < groupPlayers.length; i++) {
      for (let j = i + 1; j < groupPlayers.length; j++) {
        const matchKey = getMatchKey(groupPlayers[i].id, groupPlayers[j].id);
        if (!existingMatchKeys.has(matchKey)) {
          const match = new Match(
            `match_${Date.now()}_${Math.random()}`,
            groupPlayers[i].id,
            groupPlayers[j].id,
            group
          );
          this.matches.push(match);
        }
      }
    }
  }

  getStandings(group) {
    const groupPlayers = this.groups[group];
    const groupMatches = this.matches.filter(m => m.group === group && m.completed);

    const stats = {};
    groupPlayers.forEach(player => {
      stats[player.id] = {
        player,
        wins: 0,
        losses: 0,
        gamesWon: 0,
        gamesLost: 0,
        matchesPlayed: 0,
        headToHead: {} // Track head-to-head wins against each opponent
      };
    });

    groupMatches.forEach(match => {
      const p1Stats = stats[match.player1Id];
      const p2Stats = stats[match.player2Id];

      if (match.winnerId === match.player1Id) {
        p1Stats.wins++;
        p2Stats.losses++;
        // Track head-to-head
        p1Stats.headToHead[match.player2Id] = (p1Stats.headToHead[match.player2Id] || 0) + 1;
        p2Stats.headToHead[match.player1Id] = (p2Stats.headToHead[match.player1Id] || 0);
      } else {
        p2Stats.wins++;
        p1Stats.losses++;
        // Track head-to-head
        p2Stats.headToHead[match.player1Id] = (p2Stats.headToHead[match.player1Id] || 0) + 1;
        p1Stats.headToHead[match.player2Id] = (p1Stats.headToHead[match.player2Id] || 0);
      }

      p1Stats.gamesWon += match.player1Score;
      p1Stats.gamesLost += match.player2Score;
      p2Stats.gamesWon += match.player2Score;
      p2Stats.gamesLost += match.player1Score;
      p1Stats.matchesPlayed++;
      p2Stats.matchesPlayed++;
    });

    // Helper function to get head-to-head record between two players
    const getHeadToHead = (playerAId, playerBId) => {
      const aStats = stats[playerAId];
      const bStats = stats[playerBId];
      const aWins = aStats.headToHead[playerBId] || 0;
      const bWins = bStats.headToHead[playerAId] || 0;
      return { aWins, bWins };
    };

    // Sort by:
    // 1. Wins (desc) - most wins first
    // 2. Losses (asc) - if same wins, fewer losses is better
    // 3. Games won (desc) - if same wins AND losses, more games won is better
    // 4. Games lost (asc) - if same wins, losses, and games won, fewer games lost is better
    // 5. Head-to-head record - if still tied, head-to-head result
    const standings = Object.values(stats).sort((a, b) => {
      // 1. Most wins
      if (b.wins !== a.wins) return b.wins - a.wins;
      
      // 2. Fewer losses (if same wins)
      if (a.losses !== b.losses) return a.losses - b.losses;
      
      // 3. More games won (if same wins AND same losses)
      if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
      
      // 4. Fewer games lost (if same wins, losses, and games won)
      if (a.gamesLost !== b.gamesLost) return a.gamesLost - b.gamesLost;
      
      // 5. Head-to-head record (if still tied)
      const h2h = getHeadToHead(a.player.id, b.player.id);
      if (h2h.aWins !== h2h.bWins) return h2h.bWins - h2h.aWins;
      
      // If still tied, maintain current order
      return 0;
    });

    return standings;
  }

  getTop4(group) {
    const standings = this.getStandings(group);
    return standings.slice(0, 4).map(s => s.player);
  }

  calculateQualificationProbability(playerId, group) {
    const standings = this.getStandings(group);
    const playerIndex = standings.findIndex(s => s.player.id === playerId);
    
    if (playerIndex === -1) return 0;
    if (playerIndex < 4) return 100; // Already in top 4

    const player = standings[playerIndex];
    const remainingMatches = this.matches.filter(m => 
      m.group === group && 
      !m.completed && 
      (m.player1Id === playerId || m.player2Id === playerId)
    );

    if (remainingMatches.length === 0) return 0;

    // Simple probability calculation based on current position and remaining matches
    const playersAhead = playerIndex;
    const playersBehind = standings.length - playerIndex - 1;
    const maxPossibleWins = player.wins + remainingMatches.length;
    
    // Check how many players ahead could potentially be caught
    let catchablePlayers = 0;
    for (let i = 0; i < Math.min(4, playerIndex); i++) {
      const aheadPlayer = standings[i];
      const aheadRemainingMatches = this.matches.filter(m => 
        m.group === group && 
        !m.completed && 
        (m.player1Id === aheadPlayer.player.id || m.player2Id === aheadPlayer.player.id)
      );
      const aheadMaxWins = aheadPlayer.wins + aheadRemainingMatches.length;
      
      if (maxPossibleWins > aheadMaxWins || 
          (maxPossibleWins === aheadMaxWins && player.gamesWon > aheadPlayer.gamesWon)) {
        catchablePlayers++;
      }
    }

    // Simplified probability: based on position and remaining matches
    const baseProbability = Math.max(0, 100 - (playerIndex - 3) * 25);
    const matchBonus = remainingMatches.length * 10;
    
    return Math.min(100, baseProbability + matchBonus);
  }

  getOverallRankings() {
    const groupAStandings = this.getStandings('A');
    const groupBStandings = this.getStandings('B');
    
    // Combine and rank all players
    const allStandings = [...groupAStandings, ...groupBStandings];
    
    // Sort by the same criteria as group standings:
    // 1. Wins (desc)
    // 2. Losses (asc) - fewer losses is better
    // 3. Games won (desc) - if same wins AND losses, more games won is better
    // 4. Games lost (asc) - if same wins, losses, and games won, fewer games lost is better
    // Note: Head-to-head only applies within groups, so we skip it for overall rankings
    allStandings.sort((a, b) => {
      // 1. Most wins
      if (b.wins !== a.wins) return b.wins - a.wins;
      
      // 2. Fewer losses (if same wins)
      if (a.losses !== b.losses) return a.losses - b.losses;
      
      // 3. More games won (if same wins AND same losses)
      if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
      
      // 4. Fewer games lost (if same wins, losses, and games won)
      if (a.gamesLost !== b.gamesLost) return a.gamesLost - b.gamesLost;
      
      // If still tied, maintain current order
      return 0;
    });

    return allStandings.map((s, index) => ({
      ...s,
      overallRank: index + 1
    }));
  }
}

