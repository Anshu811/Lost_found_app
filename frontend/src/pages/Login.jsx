import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="icon">🔍</span>
          <h1>Lost & Found</h1>
          <p>CAMPUS ITEM TRACKER</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" placeholder="student@college.edu"
            value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'ACCESSING...' : 'LOGIN →'}
        </button>

        <div className="auth-switch">
          Don't have an account? <a onClick={() => navigate('/register')}>Register</a>
        </div>
      </div>
    </div>
  );
}