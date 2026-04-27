import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, updateProfile as updateAuthProfile } from 'firebase/auth';
import { deleteField, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  username: string;
  gender: 'men' | 'women' | 'unisex';
  basePhotoBase64?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  createProfile: (profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProfile: (profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function toFirestoreProfile(data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  return {
    username: data.username,
    gender: data.gender,
    ...(data.basePhotoBase64 ? { basePhotoBase64: data.basePhotoBase64 } : {}),
  };
}

function toFirestoreProfileUpdate(data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  return {
    username: data.username,
    gender: data.gender,
    basePhotoBase64: data.basePhotoBase64 || deleteField(),
  };
}

function toLegacyFirestoreProfile(data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  return {
    gender: data.gender,
    ...(data.basePhotoBase64 ? { basePhotoBase64: data.basePhotoBase64 } : {}),
  };
}

function isPermissionError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<UserProfile>;
            setProfile({
              username: data.username || u.displayName?.split(' ')[0] || 'User',
              gender: data.gender || 'unisex',
              basePhotoBase64: data.basePhotoBase64 || null,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            });
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const createProfile = async (data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error("Not logged in");
    await updateAuthProfile(user, { displayName: data.username });
    const newProfile = {
      ...toFirestoreProfile(data),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (error) {
      if (!isPermissionError(error)) throw error;
      await setDoc(doc(db, 'users', user.uid), {
        ...toLegacyFirestoreProfile(data),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    setProfile({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateProfile = async (data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error("Not logged in");
    await updateAuthProfile(user, { displayName: data.username });
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...toFirestoreProfileUpdate(data),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      if (!isPermissionError(error)) throw error;
      await setDoc(doc(db, 'users', user.uid), {
        ...toLegacyFirestoreProfile(data),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    setProfile({
      ...data,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut, createProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
