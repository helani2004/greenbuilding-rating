import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { api } from './api';

export default function OnlineSession({
  children,
}: {
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then(result => setUser(result.user))
      .catch(error => setError(error.message))
      .finally(() => setReady(true));
  }, []);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      sessionStorage.removeItem('green-admin');

      const result = await api('/auth/login', {
        email,
        password,
      });

      setUser(result.user);
      setPassword('');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!confirm('Sign out? Save your work first.')) return;

    setBusy(true);

    try {
      await api('/auth/logout', {});
      sessionStorage.removeItem('green-admin');
      setUser(null);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p style={{ padding: 32 }}>Connecting…</p>;
  }

  if (!user) {
    return (
      <main
        style={{
          maxWidth: 460,
          margin: '60px auto',
          padding: 24,
        }}
      >
        <h1>Green Building Rating</h1>
        <p>Sign in using your assessment account.</p>

        <form className="card" onSubmit={signIn}>
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button className="primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => location.reload()}
          >
            Retry connection
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <div
        className="online-account"
        style={{
          padding: '8px 20px',
          textAlign: 'right',
          background: '#eaf2ec',
        }}
      >
        {user.email}
        {' · '}
        <button
          className="secondary"
          onClick={() => void signOut()}
          disabled={busy}
        >
          Sign out
        </button>
      </div>

      {children}
    </>
  );
}
