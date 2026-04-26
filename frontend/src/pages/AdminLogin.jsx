import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      if (user.role === 'admin') navigate('/admin');
      else setError("Unauthorized access.");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex text-on-surface bg-surface-container-low">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-surface-container flex-col justify-center items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
         <ShieldCheck size={120} className="text-primary mb-8 opacity-90" />
         <h1 className="text-4xl font-display font-semibold mb-4 text-center">The Academic<br/>Sanctuary</h1>
         <p className="text-on-surface-variant font-medium text-lg">Admin Portal / Global Command</p>
      </div>

      {/* Login panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-container-lowest">
        <div className="max-w-md w-full">
          <div className="mb-10 lg:hidden">
            <h1 className="text-3xl font-display font-semibold text-primary">Admin Portal</h1>
          </div>
          
          <h2 className="text-2xl font-display font-medium mb-2">Welcome Back</h2>
          <p className="text-on-surface-variant mb-8 font-body">Please enter your authoritative credentials to proceed.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 font-body">Administrator ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-on-surface-variant" />
                </div>
                <input 
                  type="text" 
                  className="input-academic pl-10" 
                  value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 font-body">Passphrase</label>
              <input 
                type="password" 
                className="input-academic" 
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-error text-sm font-medium">{error}</p>}

            <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
