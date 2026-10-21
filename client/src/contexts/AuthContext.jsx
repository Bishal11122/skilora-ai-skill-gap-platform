import { createContext, useEffect, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { getAuth, postAuth, patchAuth } from '../services/api';

export const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  error: null,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateDisplayName: async () => {},
  refreshProfile: async () => {},
});

/**
 * Maps Firebase Auth error codes to safe, friendly messages.
 * Never reveals whether an email account exists.
 */
export function mapAuthError(error) {
  if (!error) return 'An error occurred';

  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 8 characters long.';
    case 'auth/invalid-email':
      return 'Please provide a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches or repairs user profile from backend Firestore document users/{uid}.
   */
  const syncProfile = useCallback(async (firebaseUser, fallbackDisplayName = '') => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }

    // 1. Try GET /api/users/me
    const { data: existingProfile } = await getAuth('/users/me');

    if (existingProfile) {
      setProfile(existingProfile);
      return existingProfile;
    }

    // 2. If 404 or missing, create or repair via POST /api/users/me
    const displayNameToSet =
      fallbackDisplayName || firebaseUser.displayName || 'Learner';

    const { data: createdProfile } = await postAuth('/users/me', {
      displayName: displayNameToSet,
    });

    if (createdProfile) {
      setProfile(createdProfile);
      return createdProfile;
    }

    return null;
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncProfile]);

  /**
   * Register a new user with Firebase and establish backend profile.
   */
  const register = async (displayName, email, password) => {
    setError(null);
    if (!auth) {
      throw new Error('Authentication service is not configured');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Set display name in Firebase Auth
      await updateFirebaseProfile(userCredential.user, {
        displayName: displayName.trim(),
      });

      // Synchronize backend Firestore profile
      const userProfile = await syncProfile(
        userCredential.user,
        displayName.trim()
      );

      setUser(userCredential.user);
      return { user: userCredential.user, profile: userProfile };
    } catch (err) {
      const friendlyMessage = mapAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Login with email and password.
   */
  const login = async (email, password) => {
    setError(null);
    if (!auth) {
      throw new Error('Authentication service is not configured');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userProfile = await syncProfile(userCredential.user);

      setUser(userCredential.user);
      return { user: userCredential.user, profile: userProfile };
    } catch (err) {
      const friendlyMessage = mapAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Log out cleanly.
   */
  const logout = async () => {
    setError(null);
    if (!auth) return;

    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /**
   * Password reset email.
   */
  const resetPassword = async (email) => {
    setError(null);
    if (!auth) {
      throw new Error('Authentication service is not configured');
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      // Return safe message
      const friendlyMessage = mapAuthError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Update display name in Firebase Auth and backend Firestore profile.
   */
  const updateDisplayName = async (newDisplayName) => {
    if (!auth?.currentUser) {
      throw new Error('Not authenticated');
    }

    const trimmed = newDisplayName.trim();

    // 1. Update Firebase Auth
    await updateFirebaseProfile(auth.currentUser, {
      displayName: trimmed,
    });

    // 2. Update backend profile via PATCH /api/users/me
    const { data: updatedProfile, error: patchErr } = await patchAuth(
      '/users/me',
      {
        displayName: trimmed,
      }
    );

    if (patchErr) {
      throw new Error(patchErr);
    }

    setProfile(updatedProfile);
    return updatedProfile;
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await syncProfile(user);
    }
    return null;
  }, [user, syncProfile]);

  const value = {
    user,
    profile,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateDisplayName,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
