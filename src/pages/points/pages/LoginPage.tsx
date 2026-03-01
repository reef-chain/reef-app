import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Uik from '@reef-chain/ui-kit';
import { useAuth } from '../contexts/AuthContext';
import { useFormo } from '@formo/analytics';
import ReefSigners from '../../../context/ReefSigners';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const analyticsFormo = useFormo();
  const { network: nw } = useContext(ReefSigners);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/points/dashboard';

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setError(null);
    
    analyticsFormo.track('points_login_attempt', {
      username,
      network: nw?.name || 'mainnet',
    });
    
    try {
      const response = await login({ username, password });
      
      analyticsFormo.track('points_login_success', {
        user_id: response?.admin?.id || response?.admin?.userId || null,
        evm_address: response?.admin?.evmAddress || response?.admin?.address || null,
        network: nw?.name || 'mainnet',
      });
      
      navigate(from, { replace: true });
    } catch (err: any) {
      analyticsFormo.track('points_login_failed', {
        error_code: (err as any)?.response?.status || (err as any)?.code || 'UNKNOWN',
        error_message: (err as any)?.response?.data?.message || (err as any)?.message || 'Login failed',
        network: nw?.name || 'mainnet',
      });
      
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
