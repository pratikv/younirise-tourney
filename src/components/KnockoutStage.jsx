import { useEffect, useRef } from 'react';
import './KnockoutStage.css';

function KnockoutStage({ tournament }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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

  const drawBracket = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container || top4A.length < 4 || top4B.length < 4) return;

    const dpr = window.devicePixelRatio || 1;
    
    // Constants
    const boxWidth = 200;
    const boxHeight = 45;
    const boxSpacing = 0;
    const matchSpacing = 20;
    const connectorWidth = 60;
    const headerHeight = 50;
    const padding = 20;
    const startY = headerHeight + padding;
    
    // Calculate total dimensions needed
    const matchHeight = boxHeight * 2 + boxSpacing;
    const qfTotalHeight = (matchHeight + matchSpacing) * 4 - matchSpacing;
    const totalHeight = qfTotalHeight + startY + padding;
    
    const qfX = padding;
    const qfToSfX = qfX + boxWidth + padding;
    const sfX = qfToSfX + connectorWidth;
    const sfToFinalX = sfX + boxWidth + padding;
    const finalX = sfToFinalX + connectorWidth;
    const finalToChampX = finalX + boxWidth + padding;
    const champX = finalToChampX + connectorWidth;
    const totalWidth = champX + boxWidth + padding;
    
    // Set container and canvas size
    container.style.width = `${totalWidth}px`;
    container.style.height = `${totalHeight}px`;
    
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, totalWidth, totalHeight);
    
    // Helper function to draw a team box
    const drawTeamBox = (x, y, text, isChampion = false) => {
      ctx.fillStyle = '#f5f5f5';
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      if (isChampion) {
        ctx.fillStyle = '#fff9e6';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
      }
      
      ctx.fillRect(x, y, boxWidth, boxHeight);
      ctx.strokeRect(x, y, boxWidth, boxHeight);
      
      // Draw text
      ctx.fillStyle = '#333';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      const textX = x + 15;
      const textY = y + boxHeight / 2;
      
      // Truncate text if too long
      const maxWidth = boxWidth - 30;
      let displayText = text;
      const metrics = ctx.measureText(text);
      if (metrics.width > maxWidth) {
        while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '...';
      }
      
      ctx.fillText(displayText, textX, textY);
    };
    
    // Helper function to draw round header
    const drawRoundHeader = (x, y, text) => {
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + boxWidth / 2, y);
      
      // Draw underline
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 15);
      ctx.lineTo(x + boxWidth, y + 15);
      ctx.stroke();
    };
    
    // Helper function to draw elbow connector
    const drawElbowConnector = (startX, startY, endX, endY) => {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      
      // Calculate midpoint for the elbow
      const midX = (startX + endX) / 2;
      
      ctx.beginPath();
      // Horizontal line from start box
      ctx.moveTo(startX, startY);
      ctx.lineTo(midX, startY);
      // Vertical line (elbow)
      ctx.lineTo(midX, endY);
      // Horizontal line to end box
      ctx.lineTo(endX, endY);
      ctx.stroke();
    };
    
    // Draw Quarterfinals
    drawRoundHeader(qfX, padding, 'QUARTERFINALS');
    let currentY = startY;
    const qfMatchCenters = [];
    
    matchups.forEach((matchup, index) => {
      const player1Name = getPlayerName(matchup.player1);
      const player2Name = getPlayerName(matchup.player2);
      
      drawTeamBox(qfX, currentY, player1Name);
      drawTeamBox(qfX, currentY + boxHeight + boxSpacing, player2Name);
      
      const matchCenterY = currentY + boxHeight;
      qfMatchCenters.push(matchCenterY);
      
      const matchHeight = boxHeight * 2 + boxSpacing;
      currentY += matchHeight + matchSpacing;
    });
    
    // Calculate SF positions
    const sf1Y = startY;
    const sf2Y = startY + (boxHeight * 2 + boxSpacing + matchSpacing) * 2;
    
    // Draw connectors from QF to SF
    // QF1 -> SF1 top
    drawElbowConnector(
      qfX + boxWidth,
      qfMatchCenters[0],
      sfX,
      sf1Y + boxHeight / 2
    );
    
    // QF2 -> SF1 bottom
    drawElbowConnector(
      qfX + boxWidth,
      qfMatchCenters[1],
      sfX,
      sf1Y + boxHeight + boxSpacing + boxHeight / 2
    );
    
    // QF3 -> SF2 top
    drawElbowConnector(
      qfX + boxWidth,
      qfMatchCenters[2],
      sfX,
      sf2Y + boxHeight / 2
    );
    
    // QF4 -> SF2 bottom
    drawElbowConnector(
      qfX + boxWidth,
      qfMatchCenters[3],
      sfX,
      sf2Y + boxHeight + boxSpacing + boxHeight / 2
    );
    
    // Draw Semifinals
    drawRoundHeader(sfX, padding, 'SEMIFINALS');
    
    drawTeamBox(sfX, sf1Y, 'Winner QF1');
    drawTeamBox(sfX, sf1Y + boxHeight + boxSpacing, 'Winner QF2');
    
    drawTeamBox(sfX, sf2Y, 'Winner QF3');
    drawTeamBox(sfX, sf2Y + boxHeight + boxSpacing, 'Winner QF4');
    
    const sf1CenterY = sf1Y + boxHeight;
    const sf2CenterY = sf2Y + boxHeight;
    
    // Draw connector lines from SF to Final
    drawElbowConnector(
      sfX + boxWidth,
      sf1CenterY,
      finalX,
      (sf1CenterY + sf2CenterY) / 2
    );
    
    drawElbowConnector(
      sfX + boxWidth,
      sf2CenterY,
      finalX,
      (sf1CenterY + sf2CenterY) / 2
    );
    
    // Draw Final
    drawRoundHeader(finalX, padding, 'FINAL');
    const finalY = (sf1CenterY + sf2CenterY) / 2 - boxHeight;
    
    drawTeamBox(finalX, finalY, 'Winner SF1');
    drawTeamBox(finalX, finalY + boxHeight + boxSpacing, 'Winner SF2');
    
    const finalCenterY = finalY + boxHeight;
    
    // Draw connector line to champion
    drawElbowConnector(
      finalX + boxWidth,
      finalCenterY,
      champX,
      finalCenterY
    );
    
    // Draw Champion
    drawRoundHeader(champX, padding, 'CHAMPION');
    const champY = finalCenterY - boxHeight / 2;
    
    drawTeamBox(champX, champY, 'Winner Final', true);
    
    // Draw trophy
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', champX + boxWidth / 2, champY + boxHeight + 25);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      drawBracket();
    }, 100);

    window.addEventListener('resize', drawBracket);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', drawBracket);
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
        <div className="bracket-canvas-container" ref={containerRef}>
          <canvas ref={canvasRef} className="bracket-canvas" />
        </div>
      )}
    </div>
  );
}

export default KnockoutStage;
