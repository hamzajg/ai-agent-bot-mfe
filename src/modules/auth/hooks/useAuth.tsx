import { useNavigate } from 'react-router-dom';
import { AuthService } from '..';

export const useAuth = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    AuthService.isLoggedIn() && navigate('/dashboard');
  };

  return {
    handleAuthSuccess,
  };
};