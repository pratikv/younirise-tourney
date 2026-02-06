import { useEffect, useMemo, useRef, useState } from 'react';
import './KnockoutStage.css';

function KnockoutStage({ tournament, isEditable, onUpdateKnockoutMatch }) {
  const containerRef = useRef(null);
  const boxRefs = useRef({});
  const [paths, setPaths] = useState([]);
  const [scoreInputs, setScoreInputs] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const top4A = tournament.getTop4('A');
  const top4B = tournament.getTop4('B');

  // Create matchups: A1 vs B4, A3 vs B2, A2 vs B3, A4 vs B1
  const matchups = useMemo(() => ([
    { id: 1, player1: top4A[0], player2: top4B[3], rank1: 'A1', rank2: 'B4' },
    { id: 2, player1: top4A[2], player2: top4B[1], rank1: 'A3', rank2: 'B2' },
    { id: 3, player1: top4A[1], player2: top4B[2], rank1: 'A2', rank2: 'B3' },
    { id: 4, player1: top4A[3], player2: top4B[0], rank1: 'A4', rank2: 'B1' },
  ]), [top4A, top4B]);

  const getPlayerName = (player) => {
    if (!player) return 'TBD';
    return player.name;
  };

  const getSavedMatch = (matchId, player1, player2) => {
    const saved = tournament.knockoutMatches?.[matchId];
    if (!saved || !player1 || !player2) return null;
    if (saved.player1Id !== player1.id || saved.player2Id !== player2.id) return null;
    return saved;
  };

  const getWinner = (saved, player1, player2) => {
    if (!saved || !saved.completed) return null;
    if (saved.winnerId === player1?.id) return player1;
    if (saved.winnerId === player2?.id) return player2;
    return null;
  };

  const qfMatches = useMemo(() => (
    matchups.map((matchup, index) => {
      const matchId = `qf${index + 1}`;
      const saved = getSavedMatch(matchId, matchup.player1, matchup.player2);
      return {
        matchId,
        player1: matchup.player1,
        player2: matchup.player2,
        saved,
        label1: matchup.rank1,
        label2: matchup.rank2
      };
    })
  ), [matchups, tournament.knockoutMatches]);

  const qfWinners = qfMatches.map(match => getWinner(match.saved, match.player1, match.player2));

  const sfMatches = useMemo(() => {
    const raw = [
      { matchId: 'sf1', player1: qfWinners[0], player2: qfWinners[1], label1: 'Winner QF1', label2: 'Winner QF2' },
      { matchId: 'sf2', player1: qfWinners[2], player2: qfWinners[3], label1: 'Winner QF3', label2: 'Winner QF4' }
    ];
    return raw.map(match => ({
      ...match,
      saved: getSavedMatch(match.matchId, match.player1, match.player2)
    }));
  }, [qfWinners, tournament.knockoutMatches]);

  const sfWinners = sfMatches.map(match => getWinner(match.saved, match.player1, match.player2));

  const finalMatch = useMemo(() => {
    const match = {
      matchId: 'final',
      player1: sfWinners[0],
      player2: sfWinners[1],
      label1: 'Winner SF1',
      label2: 'Winner SF2'
    };
    return { ...match, saved: getSavedMatch(match.matchId, match.player1, match.player2) };
  }, [sfWinners, tournament.knockoutMatches]);

  useEffect(() => {
    const allMatches = [...qfMatches, ...sfMatches, finalMatch];
    setScoreInputs(prev => {
      const next = { ...prev };
      let changed = false;
      allMatches.forEach(match => {
        if (match.saved) {
          const savedP1 = match.saved.player1Score ?? '';
          const savedP2 = match.saved.player2Score ?? '';
          const current = next[match.matchId];
          if (!current || current.p1 !== savedP1 || current.p2 !== savedP2) {
            next[match.matchId] = { p1: savedP1, p2: savedP2 };
            changed = true;
          }
        } else if (!match.player1 || !match.player2) {
          if (next[match.matchId]) {
            delete next[match.matchId];
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [qfMatches, sfMatches, finalMatch]);

  const updateScoreInput = (matchId, side, value) => {
    setScoreInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: value
      }
    }));
  };

  const handleSave = (match) => {
    if (!onUpdateKnockoutMatch) return;
    setErrorMessage('');
    if (!match.player1 || !match.player2) {
      setErrorMessage('Waiting for previous round winners.');
      return;
    }
    const input = scoreInputs[match.matchId] || {};
    const error = onUpdateKnockoutMatch(
      match.matchId,
      match.player1.id,
      match.player2.id,
      input.p1 ?? '',
      input.p2 ?? ''
    );
    if (error) {
      setErrorMessage(error);
    }
  };

  const boxHeight = 44;
  const boxGap = 8;
  const matchGap = 24;
  const matchHeight = boxHeight * 2 + boxGap;
  const matchStep = matchHeight + matchGap;
  const qfMatchTops = [0, matchStep, matchStep * 2, matchStep * 3];
  const qfCenters = qfMatchTops.map(top => top + boxHeight + boxGap / 2);
  const sfTopBoxes = [qfCenters[0] - boxHeight / 2, qfCenters[2] - boxHeight / 2];
  const sfBottomBoxes = [qfCenters[1] - boxHeight / 2, qfCenters[3] - boxHeight / 2];
  const sfCenters = [
    (qfCenters[0] + qfCenters[1]) / 2,
    (qfCenters[2] + qfCenters[3]) / 2
  ];
  const finalTopBoxes = [sfCenters[0] - boxHeight / 2];
  const finalBottomBoxes = [sfCenters[1] - boxHeight / 2];
  const finalCenter = (sfCenters[0] + sfCenters[1]) / 2;
  const champTop = finalCenter - boxHeight / 2;
  const totalHeight = qfMatchTops[3] + matchHeight;

  const setBoxRef = (key) => (element) => {
    if (element) {
      boxRefs.current[key] = element;
    }
  };

  useEffect(() => {
    const updatePaths = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const getPoint = (key, side) => {
        const el = boxRefs.current[key];
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const x = side === 'right' ? rect.right - containerRect.left : rect.left - containerRect.left;
        const y = rect.top - containerRect.top + rect.height / 2;
        return { x, y };
      };

      const connections = [
        ['qf1p1', 'sf1top'],
        ['qf1p2', 'sf1top'],
        ['qf2p1', 'sf1bottom'],
        ['qf2p2', 'sf1bottom'],
        ['qf3p1', 'sf2top'],
        ['qf3p2', 'sf2top'],
        ['qf4p1', 'sf2bottom'],
        ['qf4p2', 'sf2bottom'],
        ['sf1top', 'finaltop'],
        ['sf1bottom', 'finaltop'],
        ['sf2top', 'finalbottom'],
        ['sf2bottom', 'finalbottom'],
        ['finaltop', 'champ'],
        ['finalbottom', 'champ']
      ];

      const nextPaths = connections
        .map(([fromKey, toKey]) => {
          const from = getPoint(fromKey, 'right');
          const to = getPoint(toKey, 'left');
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          return `M ${from.x} ${from.y} H ${midX} V ${to.y} H ${to.x}`;
        })
        .filter(Boolean);

      setPaths(nextPaths);
    };

    const rafUpdate = () => requestAnimationFrame(updatePaths);
    rafUpdate();

    const observer = new ResizeObserver(rafUpdate);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    Object.values(boxRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });
    window.addEventListener('resize', rafUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', rafUpdate);
    };
  }, [top4A, top4B]);

  return (
    <div className="knockout-stage">
      <h2 className="bracket-title">TOURNAMENT BRACKET</h2>

      {top4A.length < 4 || top4B.length < 4 ? (
        <div className="incomplete-message">
          <p>⚠️ Knockout stage will be available once both groups have at least 4 players.</p>
          <div className="qualification-status">
            <div className="status-item">
              <strong>Group A:</strong> {top4A.length}/4 qualified
            </div>
            <div className="status-item">
              <strong>Group B:</strong> {top4B.length}/4 qualified
            </div>
          </div>
        </div>
      ) : (
        <div className="bracket-dom" ref={containerRef}>
          {errorMessage && (
            <div className="knockout-error" role="alert">{errorMessage}</div>
          )}
          <svg className="bracket-lines" aria-hidden="true">
            {paths.map((path, index) => (
              <path key={index} d={path} />
            ))}
          </svg>
          <div className="round-column qf">
            <div className="round-title">Quarterfinals</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              {qfMatches.map((match, index) => {
                const top = qfMatchTops[index];
                const scores = scoreInputs[match.matchId] || {};
                return (
                  <div
                    key={match.matchId}
                    className="match positioned"
                    style={{ top: `${top}px` }}
                  >
                    <div className="team-box" ref={setBoxRef(`qf${index + 1}p1`)}>
                      <span className="seed">{match.label1}</span>
                      <span className="team-name">{getPlayerName(match.player1)}</span>
                      {isEditable ? (
                        <input
                          className="score-input"
                          type="number"
                          min="0"
                          max="15"
                          value={scores.p1 ?? ''}
                          onChange={(event) => updateScoreInput(match.matchId, 'p1', event.target.value)}
                        />
                      ) : (
                        <span className="score-display">{match.saved?.player1Score ?? '-'}</span>
                      )}
                    </div>
                    <div className="team-box" ref={setBoxRef(`qf${index + 1}p2`)}>
                      <span className="seed">{match.label2}</span>
                      <span className="team-name">{getPlayerName(match.player2)}</span>
                      {isEditable ? (
                        <input
                          className="score-input"
                          type="number"
                          min="0"
                          max="15"
                          value={scores.p2 ?? ''}
                          onChange={(event) => updateScoreInput(match.matchId, 'p2', event.target.value)}
                        />
                      ) : (
                        <span className="score-display">{match.saved?.player2Score ?? '-'}</span>
                      )}
                    </div>
                    {isEditable && (
                      <button
                        type="button"
                        className="match-save"
                        onClick={() => handleSave(match)}
                      >
                        Save
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="round-column sf">
            <div className="round-title">Semifinals</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              {sfMatches.map((match, index) => {
                const isFirst = index === 0;
                const topBox = isFirst ? sfTopBoxes[0] : sfTopBoxes[1];
                const bottomBox = isFirst ? sfBottomBoxes[0] : sfBottomBoxes[1];
                const scores = scoreInputs[match.matchId] || {};
                return (
                  <div
                    key={match.matchId}
                    className="match positioned"
                    style={{ top: `${topBox}px` }}
                  >
                    <div className="team-box placeholder" ref={setBoxRef(`sf${index + 1}top`)}>
                      <span className="team-name">{getPlayerName(match.player1) === 'TBD' ? match.label1 : getPlayerName(match.player1)}</span>
                      {isEditable ? (
                        <input
                          className="score-input"
                          type="number"
                          min="0"
                          max="15"
                          value={scores.p1 ?? ''}
                          onChange={(event) => updateScoreInput(match.matchId, 'p1', event.target.value)}
                          disabled={!match.player1 || !match.player2}
                        />
                      ) : (
                        <span className="score-display">{match.saved?.player1Score ?? '-'}</span>
                      )}
                    </div>
                    <div className="team-box placeholder" ref={setBoxRef(`sf${index + 1}bottom`)} style={{ marginTop: `${bottomBox - topBox - boxHeight}px` }}>
                      <span className="team-name">{getPlayerName(match.player2) === 'TBD' ? match.label2 : getPlayerName(match.player2)}</span>
                      {isEditable ? (
                        <input
                          className="score-input"
                          type="number"
                          min="0"
                          max="15"
                          value={scores.p2 ?? ''}
                          onChange={(event) => updateScoreInput(match.matchId, 'p2', event.target.value)}
                          disabled={!match.player1 || !match.player2}
                        />
                      ) : (
                        <span className="score-display">{match.saved?.player2Score ?? '-'}</span>
                      )}
                    </div>
                    {isEditable && (
                      <button
                        type="button"
                        className="match-save"
                        onClick={() => handleSave(match)}
                        disabled={!match.player1 || !match.player2}
                      >
                        Save
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="round-column final">
            <div className="round-title">Final</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              <div
                className="match positioned"
                style={{ top: `${finalTopBoxes[0]}px` }}
              >
                <div className="team-box placeholder" ref={setBoxRef('finaltop')}>
                  <span className="team-name">{getPlayerName(finalMatch.player1) === 'TBD' ? finalMatch.label1 : getPlayerName(finalMatch.player1)}</span>
                  {isEditable ? (
                    <input
                      className="score-input"
                      type="number"
                      min="0"
                      max="15"
                      value={(scoreInputs[finalMatch.matchId] || {}).p1 ?? ''}
                      onChange={(event) => updateScoreInput(finalMatch.matchId, 'p1', event.target.value)}
                      disabled={!finalMatch.player1 || !finalMatch.player2}
                    />
                  ) : (
                    <span className="score-display">{finalMatch.saved?.player1Score ?? '-'}</span>
                  )}
                </div>
                <div
                  className="team-box placeholder"
                  ref={setBoxRef('finalbottom')}
                  style={{ marginTop: `${finalBottomBoxes[0] - finalTopBoxes[0] - boxHeight}px` }}
                >
                  <span className="team-name">{getPlayerName(finalMatch.player2) === 'TBD' ? finalMatch.label2 : getPlayerName(finalMatch.player2)}</span>
                  {isEditable ? (
                    <input
                      className="score-input"
                      type="number"
                      min="0"
                      max="15"
                      value={(scoreInputs[finalMatch.matchId] || {}).p2 ?? ''}
                      onChange={(event) => updateScoreInput(finalMatch.matchId, 'p2', event.target.value)}
                      disabled={!finalMatch.player1 || !finalMatch.player2}
                    />
                  ) : (
                    <span className="score-display">{finalMatch.saved?.player2Score ?? '-'}</span>
                  )}
                </div>
                {isEditable && (
                  <button
                    type="button"
                    className="match-save"
                    onClick={() => handleSave(finalMatch)}
                    disabled={!finalMatch.player1 || !finalMatch.player2}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="round-column champ">
            <div className="round-title">Champion</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              <div className="team-box positioned champion" ref={setBoxRef('champ')} style={{ top: `${champTop}px` }}>
                <span className="team-name">{finalMatch.saved?.winnerId ? getPlayerName(
                  finalMatch.saved.winnerId === finalMatch.player1?.id ? finalMatch.player1 : finalMatch.player2
                ) : 'Winner Final'}</span>
              </div>
              <div className="trophy positioned" style={{ top: `${champTop + boxHeight + 10}px` }}>🏆</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnockoutStage;
