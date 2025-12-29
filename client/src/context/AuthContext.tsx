
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type User,
  onAuthStateChanged,
  getIdTokenResult,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';

type UserRole = 'admin' | 'employee' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isEmployee: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setToken(idToken);

        try {
          const idTokenResult = await getIdTokenResult(currentUser);
          // Check for admin claim
          if (idTokenResult.claims.admin) {
            setRole('admin');
          } else {
            setRole('employee');
          }
        } catch (e) {
          console.error("Error getting token result", e);
          setRole('employee');
        }
      } else {
        setToken(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value: AuthContextType = {
    user,
    role,
    isAdmin: role === 'admin',
    isEmployee: role === 'employee',
    isAuthenticated: !!user,
    loading,
    token,
    loginWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
