import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';
import { useCreateAdminSession } from '@workspace/api-client-react';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  adminToken: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const createSession = useCreateAdminSession();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, pass: string) => {
    if (email !== 'hello@unilink.network') {
      throw new Error('Unauthorized administrator email');
    }
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await cred.user.getIdToken();
    const session = await createSession.mutateAsync({ data: { idToken } });
    localStorage.setItem('token', session.token);
    setAdminToken(session.token);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem('token');
    setAdminToken(null);
  };

  return <AuthContext.Provider value={{ user, adminToken, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};