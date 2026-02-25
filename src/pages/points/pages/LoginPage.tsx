import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Uik from '@reef-chain/ui-kit';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/points/dashboard';

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setError(null);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '400px' }}>
        <Uik.Card title="Points Admin Login">
          <Uik.Form>
            {error && (
              <Uik.Alert type="danger" text={error} />
            )}
            <Uik.Input
              label="Username"
              value={username}
              placeholder="Enter username"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Uik.Input
              label="Password"
              type="password"
              value={password}
              placeholder="Enter password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Uik.Button
              fill
              text="Login"
              loading={isLoading}
              onClick={handleSubmit}
            />
          </Uik.Form>
        </Uik.Card>
      </div>
    </div>
  );
}

export default LoginPage;
