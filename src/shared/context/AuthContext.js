import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const tokenIsUsable = (jwt) => {
  if (!jwt || jwt.split('.').length < 2) return false;
  try {
    const segment = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = segment + '='.repeat((4 - (segment.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp !== 'number' || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const clearStoredSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && tokenIsUsable(storedToken)) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearStoredSession();
      }
    } else if (storedToken || storedUser) {
      clearStoredSession();
    }
    setIsLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateProfilePicture = (profilePictureUrl) => {
    const updatedUser = { ...user, profilePictureUrl };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    updateProfilePicture,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



