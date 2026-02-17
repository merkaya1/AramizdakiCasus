import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Anonim giriş yap
export const signInUser = async () => {
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error) {
        console.error("Auth error:", error);
        throw error;
    }
};

// Auth durumu izleyici
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Mevcut kullanıcı ID'si
export const getCurrentUserId = () => {
    return auth.currentUser ? auth.currentUser.uid : null;
};
