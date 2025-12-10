import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData;
    
    const API = 'http://localhost:3000'; 

    try {
      if (isRegister) {
        if (password !== confirmPassword) return alert("Senhas não conferem");
        await axios.post(`${API}/register`, { email, password });
        alert("Conta criada! Faça login.");
        setIsRegister(false);
      } else {
        const res = await axios.post(`${API}/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || "Erro de conexão");
    }
  };

  return (
    <div className="login-container">
      <div className="overlay"></div>
      
      <div className="login-card">
        <h2 className="login-title">Seja bem-vindo ao Guarda-Roupa Tricolor!</h2>
        
        <form onSubmit={handleSubmit}>
          <input 
            className="form-input" 
            name="email" 
            type="email" 
            placeholder="E-mail" 
            onChange={handleChange} 
            required 
          />
          <input 
            className="form-input" 
            name="password" 
            type="password" 
            placeholder="Senha" 
            onChange={handleChange} 
            required 
          />
          
          {isRegister && (
            <input 
              className="form-input" 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirmar Senha" 
              onChange={handleChange} 
              required 
            />
          )}

          <button type="submit" className="btn btn-primary">
            {isRegister ? 'Finalizar Cadastro' : 'Entrar no Clube'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span 
            onClick={() => setIsRegister(!isRegister)} 
            style={{ cursor: 'pointer', textDecoration: 'underline', color: '#333' }}
          >
            {isRegister ? 'Já tenho conta. Login.' : 'Não tem conta? Cadastre-se já!'}
          </span>
        </div>
      </div>
    </div>
  );
}