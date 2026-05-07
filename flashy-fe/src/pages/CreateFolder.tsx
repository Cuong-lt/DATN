import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderPlus } from 'lucide-react';
import { createFolder } from '../services/folderService';
import './CreateFolder.css';

export default function CreateFolder() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createFolder({ name: name.trim() });
      navigate('/library');
    } catch (err: any) {
      setError(err?.message || 'Failed to create folder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-folder-page">
      <header className="create-folder-header">
        <button className="back-btn" onClick={() => navigate('/library')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Create Folder</h1>
      </header>

      <div className="create-folder-content">
        <div className="create-folder-icon-wrapper">
          <div className="create-folder-icon">
            <FolderPlus size={40} />
          </div>
          <p>Create a new folder to organize your study sets</p>
        </div>

        {error && <div className="create-folder-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Folder Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Human Anatomy, Math, History..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <button type="submit" className="btn-create" disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create Folder'}
          </button>
        </form>
      </div>
    </div>
  );
}
