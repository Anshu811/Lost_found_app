import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/items';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get(API, { headers });
      setItems(data);
    } catch { logout(); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addItem = async () => {
    setError(''); setSuccess('');
    try {
      await axios.post(API, form, { headers });
      setSuccess('Item reported successfully!');
      setForm({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding item');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete');
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
  };

  const updateItem = async () => {
    try {
      await axios.put(`${API}/${editItem._id}`, editItem, { headers });
      setEditItem(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot update');
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) { fetchItems(); return; }
    try {
      const { data } = await axios.get(`${API}/search?name=${search}`, { headers });
      setItems(data);
    } catch { setItems([]); }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-brand">🔍 LOST & FOUND</div>
        <div className="topbar-user">
          <span>Welcome, <strong>{user.name || 'Student'}</strong></span>
          <button className="btn-logout" onClick={logout}>LOGOUT ⏻</button>
        </div>
      </div>

      <div className="dashboard-body">
        {/* Add Item */}
        <div className="section-title">📤 Report Item</div>
        <div className="add-item-card">
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Item Name</label>
              <input name="itemName" placeholder="e.g. Blue Backpack" value={form.itemName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Lost</option>
                <option>Found</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" placeholder="e.g. Library 2nd Floor" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact Info</label>
              <input name="contactInfo" placeholder="Phone or Email" value={form.contactInfo} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input name="description" placeholder="Brief description" value={form.description} onChange={handleChange} />
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={addItem}>
            + REPORT ITEM
          </button>
        </div>

        {/* Search */}
        <div className="section-title">🔎 Search Items</div>
        <div className="search-bar">
          <input placeholder="Search by name or type (Lost/Found)..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <button className="btn-search" onClick={handleSearch}>Search</button>
          <button className="btn-clear" onClick={() => { setSearch(''); fetchItems(); }}>Clear</button>
        </div>

        {/* Items */}
        <div className="section-title">📋 All Items ({items.length})</div>
        <div className="items-grid">
          {items.length === 0 ? (
            <div className="no-items">
              <span className="icon">📭</span>
              <p>No items found</p>
            </div>
          ) : items.map(item => (
            <div key={item._id} className={`item-card ${item.type.toLowerCase()}`}>
              <span className={`item-badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
              <div className="item-name">{item.itemName}</div>
              <div className="item-desc">{item.description || 'No description'}</div>
              <div className="item-meta">
                <span>📍 <em>{item.location}</em></span>
                <span>📅 <em>{new Date(item.date).toLocaleDateString()}</em></span>
                <span>📞 <em>{item.contactInfo}</em></span>
                {item.postedBy && <span>👤 <em>{item.postedBy.name}</em></span>}
              </div>
              {item.postedBy?._id === user.id && (
                <div className="item-actions">
                  <button className="btn-edit" onClick={() => openEdit(item)}>✏ Edit</button>
                  <button className="btn-delete" onClick={() => deleteItem(item._id)}>🗑 Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setEditItem(null)}>
          <div className="modal-card">
            <div className="modal-title">✏️ Update Item</div>
            <div className="form-group">
              <label>Item Name</label>
              <input value={editItem.itemName} onChange={(e) => setEditItem({ ...editItem, itemName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={editItem.type} onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}>
                <option>Lost</option>
                <option>Found</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={editItem.location} onChange={(e) => setEditItem({ ...editItem, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contact Info</label>
              <input value={editItem.contactInfo} onChange={(e) => setEditItem({ ...editItem, contactInfo: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn-update" onClick={updateItem}>UPDATE ITEM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}