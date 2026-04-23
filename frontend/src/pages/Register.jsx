import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/register', form);
      setSuccess('Registered! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="icon">📦</span>
          <h1>Register</h1>
          <p>CREATE YOUR ACCOUNT</p>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" placeholder="John Doe"
            value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" placeholder="student@college.edu"
            value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" placeholder="Min 6 characters"
            value={form.password} onChange={handleChange} />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'CREATING...' : 'CREATE ACCOUNT →'}
        </button>

        <div className="auth-switch">
          Already registered? <a onClick={() => navigate('/login')}>Login</a>
        </div>
      </div>
    </div>
  );
}