import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function AuthCallback({ setUser }: { setUser: (user: any) => void }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    if (!token) {
      setError('No authentication token received');
      return;
    }

    // Save the token and get user data
    localStorage.setItem('auth_token', token);

    // Get user info
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to authenticate. Please try again.');
        localStorage.removeItem('auth_token');
      }
    };

    fetchUser();
  }, [navigate, setUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <p>Completing authentication...</p>
    </div>
  );
}