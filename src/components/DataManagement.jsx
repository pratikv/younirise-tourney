import { useRef, useState } from 'react';
import { exportToJSON, importFromJSON } from '../utils/dataSerializer';
import './DataManagement.css';

function DataManagement({ tournament, onImportTournament, isEditable = false }) {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handleExport = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      exportToJSON(tournament, `tournament-${timestamp}.json`);
      setImportSuccess('Tournament data exported successfully!');
      setTimeout(() => setImportSuccess(''), 3000);
    } catch (error) {
      setImportError(`Export failed: ${error.message}`);
      setTimeout(() => setImportError(''), 5000);
    }
  };

  const handleImport = async (event) => {
    if (!isEditable) return;
    
    const file = event.target.files[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setImportError('Please select a JSON file');
      return;
    }

    try {
      const importedTournament = await importFromJSON(file);
      onImportTournament(importedTournament);
      setImportSuccess('Tournament data imported successfully!');
      setTimeout(() => setImportSuccess(''), 3000);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportError(`Import failed: ${error.message}`);
      setTimeout(() => setImportError(''), 5000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearStorage = () => {
    try {
      localStorage.removeItem('tournament');
      setImportError('');
      setImportSuccess('Saved session data cleared. Reload to refresh data.');
      setTimeout(() => setImportSuccess(''), 3000);
    } catch (error) {
      setImportSuccess('');
      setImportError(`Could not clear data: ${error.message}`);
      setTimeout(() => setImportError(''), 5000);
    }
  };

  return (
    <div className="data-management">
      <h2>Data Management</h2>
      <p className="description">
        Export your tournament data to a JSON file for backup or sharing, 
        or import previously exported tournament data.
      </p>

      <div className="data-actions">
        <div className="action-group">
          <h3>Export Tournament Data</h3>
          <p className="action-description">
            Download all tournament data (players, matches, results) as a JSON file.
          </p>
          <button onClick={handleExport} className="export-btn">
            📥 Export to JSON
          </button>
        </div>

        {isEditable && (
          <div className="action-group">
            <h3>Import Tournament Data</h3>
            <p className="action-description">
              Load tournament data from a previously exported JSON file.
              <strong> Warning: This will replace your current tournament data.</strong>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <button onClick={handleImportClick} className="import-btn">
              📤 Import from JSON
            </button>
          </div>
        )}

        <div className="action-group">
          <h3>Clear Saved Session Data</h3>
          <p className="action-description">
            Remove the locally saved tournament data from this browser. The app will reload
            with the default dataset on next refresh.
          </p>
          <button onClick={handleClearStorage} className="clear-btn">
            🧹 Clear session storage
          </button>
        </div>
      </div>

      {importError && (
        <div className="message error-message">
          ⚠️ {importError}
        </div>
      )}

      {importSuccess && (
        <div className="message success-message">
          ✅ {importSuccess}
        </div>
      )}

      <div className="info-section">
        <h3>Data Format</h3>
        <p>The exported JSON file contains:</p>
        <ul>
          <li>All players with their names and group assignments</li>
          <li>All matches (scheduled and completed)</li>
          <li>Match results and scores</li>
          <li>Export timestamp and version information</li>
        </ul>
      </div>
    </div>
  );
}

export default DataManagement;

