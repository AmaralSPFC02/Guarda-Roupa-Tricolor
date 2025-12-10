import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

export default function Dashboard() {
  const [shirts, setShirts] = useState([]);
  const [weather, setWeather] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ year: '', title: '', description: '', imageFileName: '' });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const API = 'http://localhost:3000';

  useEffect(() => {
    if (!token) { navigate('/'); return; }

    Promise.all([
      axios.get(`${API}/shirts`, { headers: { Authorization: token } }),
      axios.get('https://api.open-meteo.com/v1/forecast?latitude=-23.6000&longitude=-46.7201&current_weather=true')
    ])
    .then(([resShirts, resWeather]) => {
      setShirts(resShirts.data);
      setWeather(resWeather.data.current_weather.temperature);
    })
    .catch(() => navigate('/'));
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if(!window.confirm("Remover item da coleção?")) return;
    try {
      await axios.delete(`${API}/shirts/${id}`, { headers: { Authorization: token } });
      setShirts(prev => prev.filter(s => s.id !== id));
      
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir."); 
    }
  };

  const handleEditClick = (shirt) => {
    setForm(shirt);
    setEditingId(shirt.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm({ year: '', title: '', description: '', imageFileName: '' });
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { 
        const res = await axios.put(`${API}/shirts/${editingId}`, form, { headers: { Authorization: token } });
        
        setShirts(shirts.map(s => s.id === editingId ? res.data : s));
        alert("Camisa atualizada com sucesso!");
        handleCancelEdit();
      } else {
        const res = await axios.post(`${API}/shirts`, form, { headers: { Authorization: token } });
        setShirts([...shirts, res.data]);
        setForm({ year: '', title: '', description: '', imageFileName: '' });
        alert("Camisa adicionada!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar. Verifique se o Backend suporta PUT/POST.");
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="main-header">
        <div className="brand-area">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/1200px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png" 
            alt="SPFC" 
            className="logo-img"
          />
          <span className="brand-text">Guarda-Roupa Tricolor</span>
        </div>

        <div className="user-area">
          <div className="weather-badge">
            ⛅ Morumbi: {weather ?? '--'}°C
          </div>
          <button 
            onClick={() => { localStorage.removeItem('token'); navigate('/'); }} 
            className="btn btn-primary" 
            style={{ padding: '8px 20px', width: 'auto' }}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="content-wrapper">
        
        <div className={`add-bar ${editingId ? 'editing-mode' : ''}`}>
          <div style={{ minWidth: '100%', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
             <h3 style={{ margin: 0, color: editingId ? '#e67e22' : '#333' }}>
               {editingId ? '✏️ Editando Camisa:' : '+ Nova Camisa:'}
             </h3>
             {editingId && (
               <button type="button" onClick={handleCancelEdit} className="btn-link">
                 Cancelar Edição
               </button>
             )}
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap', width: '100%' }}>
             <input className="form-input" style={{ marginBottom: 0, flex: 1 }} placeholder="Ano" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required />
             <input className="form-input" style={{ marginBottom: 0, flex: 2 }} placeholder="Título" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
             <input className="form-input" style={{ marginBottom: 0, flex: 3 }} placeholder="Descrição" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
             <input className="form-input" style={{ marginBottom: 0, flex: 1 }} placeholder="Código Imagem" value={form.imageFileName} onChange={e => setForm({...form, imageFileName: e.target.value})} required />
             
             <button 
                type="submit" 
                className={editingId ? "btn btn-warning" : "btn btn-success"} 
                style={{ width: 'auto', padding: '0 30px' }}
             >
               {editingId ? 'ATUALIZAR' : 'SALVAR'}
             </button>
          </form>
        </div>

        <div className="card-grid">
          {shirts.map(shirt => (
            <div key={shirt.id} className="collection-card">
              <div className="card-img-area">
                <img 
                  src={`/img/${shirt.imageFileName}`} 
                  alt={shirt.title} 
                  onError={(e) => {e.target.src='https://placehold.co/300x300?text=Sem+Imagem';}} 
                />
              </div>
              <div className="card-body">
                <div><span className="year-tag">{shirt.year}</span></div>
                <h3 className="card-title">{shirt.title}</h3>
                <p className="card-desc">{shirt.description}</p>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEditClick(shirt)} className="btn btn-outline-edit" style={{ flex: 1 }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(shirt.id)} className="btn btn-outline-danger" style={{ flex: 1 }}>
                    Remover
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}