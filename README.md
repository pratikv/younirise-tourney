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

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16 or higher recommended)
- **npm** (comes with Node.js) or **yarn**
- **Git**

### Installing Node.js

If you don't have Node.js installed:

1. **Visit the official Node.js website**: [https://nodejs.org/](https://nodejs.org/)
2. **Download the LTS (Long Term Support) version** for your operating system
3. **Run the installer** and follow the installation wizard
4. **Verify installation** by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```

   You should see version numbers for both commands.

### Installing Git

If you don't have Git installed:

- **macOS**: Git may already be installed. If not, install via Homebrew: `brew install git` or download from [https://git-scm.com/download/mac](https://git-scm.com/download/mac)
- **Windows**: Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)
- **Linux**: Use your package manager, e.g., `sudo apt-get install git` (Ubuntu/Debian)

Verify installation:
```bash
git --version
```

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/younirise-tourney.git
```

Replace `your-username` with the actual GitHub username or organization name.

Navigate to the project directory:

```bash
cd younirise-tourney
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including React, Vite, and other required packages.

### 3. Run the Application Locally

Start the development server:

```bash
npm run dev
```

The application will start and you should see output similar to:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open your browser and navigate to `http://localhost:5173/` (or the URL shown in your terminal) to view the application.

The development server supports hot module replacement (HMR), so any changes you make to the code will automatically refresh in the browser.

### 4. Build for Production

To create a production build of the application:

```bash
npm run build
```

This will create an optimized production build in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## Deployment

### GitHub Pages Deployment

The application is configured for GitHub Pages deployment. The base path is set to `/younirise-tourney/` by default.

#### Prerequisites for GitHub Pages

1. Ensure you have a GitHub account
2. Push your code to a GitHub repository
3. Install `gh-pages` (already included in devDependencies)

#### Deployment Steps

1. **Configure the base path** (if your repository name is different):
   - Create a `.env` file in the root directory
   - Add the following line:
     ```
     VITE_BASE_PATH=/your-repo-name/
     ```
   - Replace `your-repo-name` with your actual repository name

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

   This command will:
   - Build the application for production
   - Deploy the `dist` folder to the `gh-pages` branch
   - Push the branch to your GitHub repository

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select the `gh-pages` branch
   - Select the `/root` folder
   - Click **Save**

4. **Access your deployed application**:
   - Your app will be available at: `https://your-username.github.io/younirise-tourney/`
   - It may take a few minutes for the site to be live after the first deployment

#### Custom Domain Setup

If you want to use a custom domain:

1. Update `vite.config.js` to set `base: '/'`
2. Create a `.env` file with `VITE_BASE_PATH=/`
3. Rebuild and redeploy
4. Add a `CNAME` file in the `public` directory with your domain name

### Alternative Deployment Options

#### Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

   Or connect your GitHub repository to Netlify for automatic deployments.

#### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

#### Other Static Hosting Services

Since this is a static site (after building), you can deploy to any static hosting service:
- **AWS S3 + CloudFront**
- **Firebase Hosting**
- **Surge.sh**
- **GitHub Pages** (as described above)

For all static hosting services:
1. Run `npm run build` to create the production build
2. Upload the contents of the `dist` directory to your hosting service

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

