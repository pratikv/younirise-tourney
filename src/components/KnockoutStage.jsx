import { useEffect, useRef, useState } from 'react';
import './KnockoutStage.css';

function KnockoutStage({ tournament }) {
  const containerRef = useRef(null);
  const boxRefs = useRef({});
  const [paths, setPaths] = useState([]);

  const top4A = tournament.getTop4('A');
  const top4B = tournament.getTop4('B');

  // Create matchups: A1 vs B4, A2 vs B3, A3 vs B2, A4 vs B1
  const matchups = [
    { id: 1, player1: top4A[0], player2: top4B[3], rank1: 'A1', rank2: 'B4' },
    { id: 2, player1: top4A[1], player2: top4B[2], rank1: 'A2', rank2: 'B3' },
    { id: 3, player1: top4A[2], player2: top4B[1], rank1: 'A3', rank2: 'B2' },
    { id: 4, player1: top4A[3], player2: top4B[0], rank1: 'A4', rank2: 'B1' },
  ];

  const getPlayerName = (player) => {
    if (!player) return 'TBD';
    return player.name;
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
          <svg className="bracket-lines" aria-hidden="true">
            {paths.map((path, index) => (
              <path key={index} d={path} />
            ))}
          </svg>
          <div className="round-column qf">
            <div className="round-title">Quarterfinals</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              <div className="team-box positioned" ref={setBoxRef('qf1p1')} style={{ top: `${qfMatchTops[0]}px` }}>
                <span className="seed">A1</span>
                <span className="team-name">{getPlayerName(matchups[0].player1)}</span>
              </div>
              <div className="team-box positioned" ref={setBoxRef('qf1p2')} style={{ top: `${qfMatchTops[0] + boxHeight + boxGap}px` }}>
                <span className="seed">B4</span>
                <span className="team-name">{getPlayerName(matchups[0].player2)}</span>
              </div>

              <div className="team-box positioned" ref={setBoxRef('qf2p1')} style={{ top: `${qfMatchTops[1]}px` }}>
                <span className="seed">A2</span>
                <span className="team-name">{getPlayerName(matchups[1].player1)}</span>
              </div>
              <div className="team-box positioned" ref={setBoxRef('qf2p2')} style={{ top: `${qfMatchTops[1] + boxHeight + boxGap}px` }}>
                <span className="seed">B3</span>
                <span className="team-name">{getPlayerName(matchups[1].player2)}</span>
              </div>

              <div className="team-box positioned" ref={setBoxRef('qf3p1')} style={{ top: `${qfMatchTops[2]}px` }}>
                <span className="seed">A3</span>
                <span className="team-name">{getPlayerName(matchups[2].player1)}</span>
              </div>
              <div className="team-box positioned" ref={setBoxRef('qf3p2')} style={{ top: `${qfMatchTops[2] + boxHeight + boxGap}px` }}>
                <span className="seed">B2</span>
                <span className="team-name">{getPlayerName(matchups[2].player2)}</span>
              </div>

              <div className="team-box positioned" ref={setBoxRef('qf4p1')} style={{ top: `${qfMatchTops[3]}px` }}>
                <span className="seed">A4</span>
                <span className="team-name">{getPlayerName(matchups[3].player1)}</span>
              </div>
              <div className="team-box positioned" ref={setBoxRef('qf4p2')} style={{ top: `${qfMatchTops[3] + boxHeight + boxGap}px` }}>
                <span className="seed">B1</span>
                <span className="team-name">{getPlayerName(matchups[3].player2)}</span>
              </div>
            </div>
          </div>

          <div className="round-column sf">
            <div className="round-title">Semifinals</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              <div className="team-box positioned placeholder" ref={setBoxRef('sf1top')} style={{ top: `${sfTopBoxes[0]}px` }}>
                <span className="team-name">Winner QF1</span>
              </div>
              <div className="team-box positioned placeholder" ref={setBoxRef('sf1bottom')} style={{ top: `${sfBottomBoxes[0]}px` }}>
                <span className="team-name">Winner QF2</span>
              </div>
              <div className="team-box positioned placeholder" ref={setBoxRef('sf2top')} style={{ top: `${sfTopBoxes[1]}px` }}>
                <span className="team-name">Winner QF3</span>
              </div>
              <div className="team-box positioned placeholder" ref={setBoxRef('sf2bottom')} style={{ top: `${sfBottomBoxes[1]}px` }}>
                <span className="team-name">Winner QF4</span>
              </div>
            </div>
          </div>

          <div className="round-column final">
            <div className="round-title">Final</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              <div className="team-box positioned placeholder" ref={setBoxRef('finaltop')} style={{ top: `${finalTopBoxes[0]}px` }}>
                <span className="team-name">Winner SF1</span>
              </div>
              <div className="team-box positioned placeholder" ref={setBoxRef('finalbottom')} style={{ top: `${finalBottomBoxes[0]}px` }}>
                <span className="team-name">Winner SF2</span>
              </div>
            </div>
          </div>

          <div className="round-column champ">
            <div className="round-title">Champion</div>
            <div className="round-content" style={{ height: `${totalHeight}px` }}>
              <div className="team-box positioned champion" ref={setBoxRef('champ')} style={{ top: `${champTop}px` }}>
                <span className="team-name">Winner Final</span>
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
