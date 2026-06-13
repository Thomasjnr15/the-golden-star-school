import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'student' or 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on page load
    const savedUser = localStorage.getItem('gss_user');
    const savedRole = localStorage.getItem('gss_role');
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole, token) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('gss_user', JSON.stringify(userData));
    localStorage.setItem('gss_role', userRole);
    localStorage.setItem('gss_token', token);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('gss_user');
    localStorage.removeItem('gss_role');
    localStorage.removeItem('gss_token');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
