import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('App loaded - Token exists:', !!token);
    console.log('Saved user:', savedUser);
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('User restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('Failed to parse user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('Login successful, setting user:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('App render - User exists:', !!user);

  return (
    <>
      <Toaster position="top-right" />
      {user ? (
        <ChatInterface user={user} setUser={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;