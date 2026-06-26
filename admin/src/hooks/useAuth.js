import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const useAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If no token and not on login page, redirect to login
    if (!token && window.location.pathname !== '/login') {
      navigate('/login');
    }
    
    // If has token and on login page, redirect to dashboard
    if (token && window.location.pathname === '/login') {
      navigate('/');
    }
  }, [navigate, isAuthenticated]);

  return { isAuthenticated };
}; 