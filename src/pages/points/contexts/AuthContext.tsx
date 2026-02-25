import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../api/apiService';

interface User {
  id?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  logout: () => void;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null } };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload.user, isAuthenticated: !!action.payload.user, isLoading: false };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('points_access_token');
      const expiry = localStorage.getItem('points_token_expiry');
      if (accessToken && expiry && Date.now() < parseInt(expiry, 10)) {
        try {
          const userData = await apiService.getCurrentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData.admin || userData } });
        } catch {
          apiService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        if (accessToken) apiService.logout();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.Signin(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.admin || response } });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
