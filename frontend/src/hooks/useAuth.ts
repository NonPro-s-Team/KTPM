import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
  };
};
