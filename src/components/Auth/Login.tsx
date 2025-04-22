import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, selectError, selectIsAuthenticated, selectIsLoading, clearError } from '../../store/slices/authSlice';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  useEffect(() => {
    // Очищаем ошибку при монтировании компонента
    dispatch(clearError());
  }, [dispatch]);
  
  useEffect(() => {
    // Редирект на игровую страницу, если пользователь авторизован
    if (isAuthenticated) {
      navigate('/game');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Вход в игру</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
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
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
          <p>
            <small>Для демо: email: user@example.com, пароль: password</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 