import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--jex-bg)',
      backgroundImage: 'var(--jex-mesh-gradient)',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        boxShadow: 'var(--jex-shadow-lg)',
        border: '1px solid var(--jex-border)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'white',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 20px rgba(99,102,241,0.2)'
          }}>
            <span style={{
              fontSize: '28px', fontWeight: '900',
              background: 'var(--jex-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>J</span>
          </div>
          <h1 style={{
            fontSize: '1.8rem', fontWeight: '800',
            background: 'var(--jex-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>Jexora</h1>
          <p style={{ color: 'var(--jex-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            {isRegister ? 'Create your account' : 'Inventory Management System'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="input-wrapper" style={{ marginBottom: '1.2rem' }}>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="jex-input"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div className="input-wrapper" style={{ marginBottom: '1.2rem' }}>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="jex-input"
              placeholder="you@company.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="input-wrapper" style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Password</label>
            <input
              type="password"
              className="jex-input"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff1f2', color: '#e11d48',
              padding: '12px 16px', borderRadius: '12px',
              fontSize: '0.87rem', marginBottom: '1.2rem',
              border: '1px solid #fecdd3'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="jex-btn btn-primary"
            disabled={loading}
            style={{ width: '100%', fontSize: '1rem' }}
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account →' : 'Sign In →')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--jex-text-light)' }}>
                {isRegister ? 'Already have an account?' : 'New to Jexora?'}
                <button 
                    onClick={() => { setIsRegister(!isRegister); setError(''); }}
                    style={{ 
                        background: 'none', border: 'none', 
                        color: 'var(--jex-primary)', fontWeight: '600', 
                        cursor: 'pointer', marginLeft: '5px',
                        textDecoration: 'underline'
                    }}
                >
                    {isRegister ? 'Sign In' : 'Create Account'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}
