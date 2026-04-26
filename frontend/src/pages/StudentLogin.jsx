import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

export default function StudentLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      if (user.role === 'student') navigate('/exam');
      else setError("Admins must login via the admin portal.");
    } catch (err) {
      setError("Invalid credentials. Please refer to your enrollment email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      <div className="w-full max-w-lg p-8 sm:p-12 relative z-10 card-glass rounded-2xl mx-4 border border-outline-variant">
        <div className="flex justify-center mb-8">
            <div className="bg-surface-container p-4 rounded-2xl shadow-sm">
                <BookOpen size={48} className="text-primary" />
            </div>
        </div>

        <h1 className="text-3xl font-display font-semibold text-center mb-2">Examination Entry</h1>
        <p className="text-center text-on-surface-variant font-body mb-8">
            Enter the secure credentials provided to you via email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 font-body text-on-surface">Candidate Email</label>
            <input 
              type="text" 
              className="input-academic bg-white/50" 
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 font-body text-on-surface">Secure Key</label>
            <input 
              type="password" 
              className="input-academic bg-white/50" 
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="bg-error-container text-on-error-container p-3 rounded-md text-sm font-medium">{error}</div>}

          <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">
            Begin Session
          </button>
        </form>
      </div>
    </div>
  );
}
