import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, selectError, selectIsAuthenticated, selectIsLoading, clearError } from '../../store/slices/authSlice';
import './Auth.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  useEffect(() => {

    dispatch(clearError());
  }, [dispatch]);
  
  useEffect(() => {

    if (isAuthenticated) {
      navigate('/game');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Проверяем совпадение паролей
    if (password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }
    
    // Проверяем длину пароля
    if (password.length < 6) {
      setFormError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (name.trim() && email.trim() && password.trim()) {
      dispatch(registerUser({ name, email, password }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Регистрация</h2>
        {(error || formError) && <div className="auth-error">{error || formError}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Введите имя"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введите email"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Подтвердите пароль"
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 