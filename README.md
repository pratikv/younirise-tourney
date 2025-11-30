# Tournament Management System

A comprehensive tennis tournament management application for organizing and tracking tournament matches, standings, and qualification probabilities.

## Features

- **Player Management**: Add players to Group A or Group B
- **Match Results**: Record match results with best of 15 games scoring
- **Standings**: View group standings and overall rankings
- **Qualification Probabilities**: See each player's chances of qualifying for the Super 8 (top 4)
- **Super 8 Tracking**: Automatically identifies top 4 qualifiers from each group
- **JSON Import/Export**: Export tournament data to JSON files for backup or sharing, and import previously exported data

## Scoring Rules

- **Best of 15 Games**: First player to reach 8 games wins
- **Tie Break**: At 7-7, a tie break is played (winner gets 8-7)
- **Match Completion**: Winner must have at least 8 games
- **Valid Scores**: 
  - 8-0 to 8-6 (normal win)
  - 8-7 (tie break win)
  - 9-7, 10-8, etc. (if match continues)
  - Maximum 15 games

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### GitHub Pages Deployment

The app is configured for GitHub Pages deployment. The base path is set to `/younirise-tourney/` by default.

**If your repository name is different:**
1. Create a `.env` file in the root directory
2. Set `VITE_BASE_PATH=/your-repo-name/`
3. Rebuild: `npm run build`

**To deploy:**
```bash
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch.

## Usage

1. **Add Players**: Go to the Players tab and add players to Group A or Group B
2. **Record Matches**: Navigate to Matches tab to record match results
3. **View Standings**: Check the Standings tab for group rankings and overall rankings
4. **Check Probabilities**: See qualification chances in the Qualification Chances tab
5. **Data Management**: Use the Data Management tab to export tournament data to JSON or import from a JSON file

## Data Persistence

All tournament data is automatically saved to localStorage, so your progress is preserved between sessions.

## JSON Import/Export

The application supports exporting tournament data to JSON files and importing it back:

- **Export**: Click "Export to JSON" in the Data Management tab to download a JSON file containing all tournament data
- **Import**: Click "Import from JSON" to load tournament data from a previously exported JSON file
  - **Warning**: Importing will replace your current tournament data

The JSON file includes:
- All players with their names and group assignments
- All matches (scheduled and completed)
- Match results and scores
- Export timestamp and version information

