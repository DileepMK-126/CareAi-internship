import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  User as FirebaseUser
} from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, getDocFromCache } from "firebase/firestore";


export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface IAuthService {
  getCurrentUser(): UserProfile | null;
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void;
  login(email: string, password: string): Promise<UserProfile>;
  register(name: string, email: string, password: string, role: string): Promise<UserProfile>;
  loginWithGoogle(): Promise<UserProfile>;
  logout(): Promise<void>;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: any = null;
let auth: any = null;
let db: any = null;

if (hasFirebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("[authService] setPersistence failed:", err);
    });
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      experimentalForceLongPolling: true,
    });
  } catch (err) {
    console.warn("Failed to initialize Firebase app:", err);
  }
}

export { app, auth, db };
export const isFirebaseConfigured = () => Boolean(app && auth);

class LocalAuthService implements IAuthService {
  private listeners: ((user: UserProfile | null) => void)[] = [];

  getCurrentUser(): UserProfile | null {
    const user = localStorage.getItem("careai_user");
    return user ? JSON.parse(user) : null;
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    const user = this.getCurrentUser();
    this.listeners.forEach((l) => l(user));
  }

  async login(email: string, password: string): Promise<UserProfile> {
    const usersRaw = localStorage.getItem("careai_users") || "[]";
    const users = JSON.parse(usersRaw);
    const matched = users.find((u: any) => u.email === email && u.password === password);
    if (!matched) {
      throw new Error("Invalid email or password");
    }
    const userProfile: UserProfile = {
      id: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role,
    };
    localStorage.setItem("careai_user", JSON.stringify(userProfile));
    this.notifyListeners();
    return userProfile;
  }

  async register(name: string, email: string, password: string, role: string): Promise<UserProfile> {
    const usersRaw = localStorage.getItem("careai_users") || "[]";
    const users = JSON.parse(usersRaw);
    if (users.some((u: any) => u.email === email)) {
      throw new Error("Email already registered");
    }
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      password,
      role: role || "patient",
    };
    users.push(newUser);
    localStorage.setItem("careai_users", JSON.stringify(users));
    const userProfile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };
    localStorage.setItem("careai_user", JSON.stringify(userProfile));
    this.notifyListeners();
    return userProfile;
  }

  async loginWithGoogle(): Promise<UserProfile> {
    const googleUser: UserProfile = {
      id: "google_" + Math.random().toString(36).substring(2, 9),
      name: "Google User",
      email: "user.google@careai.health",
      role: "patient",
    };
    localStorage.setItem("careai_user", JSON.stringify(googleUser));
    this.notifyListeners();
    return googleUser;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("careai_user");
    this.notifyListeners();
  }
}

async function fetchUserProfile(uid: string, defaultEmail: string, defaultName: string): Promise<UserProfile> {
  const defaultProfile: UserProfile = {
    id: uid,
    email: defaultEmail,
    name: defaultName,
    role: "patient",
  };

  if (!db) return defaultProfile;

  const docRef = doc(db, "users", uid);

  try {
    const cachedDoc = await getDocFromCache(docRef);
    if (cachedDoc.exists()) {
      const data = cachedDoc.data();
      return {
        id: uid,
        email: defaultEmail,
        name: data.name || defaultName,
        role: data.role || "patient",
      };
    }
  } catch (e) {
  }

  try {
    const serverDocPromise = getDoc(docRef);
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 1500)
    );

    const userDoc = await Promise.race([serverDocPromise, timeoutPromise]);
    if (userDoc && userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: uid,
        email: defaultEmail,
        name: data.name || defaultName,
        role: data.role || "patient",
      };
    }
  } catch (err) {
    console.warn("Firestore fetch profile failed or timed out:", err);
  }

  return defaultProfile;
}

class FirebaseAuthService implements IAuthService {
  private localFallback = new LocalAuthService();
  private currentUserCache: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];
  private isFirebaseListenerInitialized = false;

  constructor() {
    const saved = localStorage.getItem("careai_user");
    if (saved) {
      try {
        this.currentUserCache = JSON.parse(saved);
      } catch (e) {
        this.currentUserCache = null;
      }
    }
  }

  getCurrentUser(): UserProfile | null {
    if (this.currentUserCache) return this.currentUserCache;
    return this.localFallback.getCurrentUser();
  }

  private notifyListeners(user: UserProfile | null) {
    this.listeners.forEach((cb) => cb(user));
  }

  private initFirebaseListener() {
    if (this.isFirebaseListenerInitialized || !auth) return;
    this.isFirebaseListenerInitialized = true;

    onFirebaseAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      console.log(`[Auth Audit] 6. onAuthStateChanged fired timestamp=${performance.now().toFixed(2)}ms uid=${fbUser ? fbUser.uid : null}`);
      if (fbUser) {
        const defaultName = fbUser.displayName || fbUser.email?.split("@")[0] || "Google User";
        const defaultEmail = fbUser.email || "";

        const cached = localStorage.getItem("careai_user");
        let initialProfile: UserProfile = {
          id: fbUser.uid,
          email: defaultEmail,
          name: defaultName,
          role: "patient",
        };

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.id === fbUser.uid) {
              initialProfile = parsed;
            }
          } catch (e) {}
        }

        this.currentUserCache = initialProfile;
        this.notifyListeners(initialProfile);

        try {
          const updatedProfile = await fetchUserProfile(fbUser.uid, defaultEmail, defaultName);
          if (
            !this.currentUserCache ||
            this.currentUserCache.name !== updatedProfile.name ||
            this.currentUserCache.role !== updatedProfile.role
          ) {
            this.currentUserCache = updatedProfile;
            localStorage.setItem("careai_user", JSON.stringify(updatedProfile));
            this.notifyListeners(updatedProfile);
          }
        } catch (e) {
          console.warn("Background auth profile refresh skipped:", e);
        }
      } else {
        this.currentUserCache = null;
        localStorage.removeItem("careai_user");
        this.notifyListeners(null);
      }
    });
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    if (!auth) {
      return this.localFallback.onAuthStateChanged(callback);
    }

    this.listeners.push(callback);
    this.initFirebaseListener();

    if (this.currentUserCache !== null) {
      callback(this.currentUserCache);
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  async login(email: string, password: string): Promise<UserProfile> {
    if (!auth) return this.localFallback.login(email, password);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const defaultName = fbUser.displayName || fbUser.email?.split("@")[0] || "User";
      const defaultEmail = fbUser.email || email;

      const profile: UserProfile = {
        id: fbUser.uid,
        email: defaultEmail,
        name: defaultName,
        role: "patient",
      };

      this.currentUserCache = profile;
      localStorage.setItem("careai_user", JSON.stringify(profile));
      this.notifyListeners(profile);

      fetchUserProfile(fbUser.uid, defaultEmail, defaultName)
        .then((updatedProfile) => {
          if (
            updatedProfile.name !== profile.name ||
            updatedProfile.role !== profile.role
          ) {
            this.currentUserCache = updatedProfile;
            localStorage.setItem("careai_user", JSON.stringify(updatedProfile));
            this.notifyListeners(updatedProfile);
          }
        })
        .catch((e) => {
          console.warn("Background login profile refresh skipped:", e);
        });

      return profile;
    } catch (err: any) {
      console.warn("Firebase Auth login failed, falling back to local:", err.message);
      return this.localFallback.login(email, password);
    }
  }

  async register(name: string, email: string, password: string, role: string): Promise<UserProfile> {
    if (!auth) return this.localFallback.register(name, email, password, role);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const profile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || email,
        name,
        role: role || "patient",
      };

      if (db) {
        (async () => {
          try {
            await setDoc(doc(db, "users", fbUser.uid), {
              id: fbUser.uid,
              name,
              email,
              role: role || "patient",
              createdAt: new Date().toISOString(),
            });
          } catch (e) {
            console.warn("Background Firestore registration write failed:", e);
          }
        })();
      }

      this.currentUserCache = profile;
      localStorage.setItem("careai_user", JSON.stringify(profile));
      this.notifyListeners(profile);
      return profile;
    } catch (err: any) {
      console.warn("Firebase Auth registration failed, falling back to local:", err.message);
      return this.localFallback.register(name, email, password, role);
    }
  }

  async loginWithGoogle(): Promise<UserProfile> {
    if (!auth) return this.localFallback.loginWithGoogle();

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      provider.setCustomParameters({ prompt: "select_account" });

      console.log(`[Auth Audit] 2. Popup opened timestamp=${performance.now().toFixed(2)}ms`);

      // Await popup completion so navigation to Dashboard occurs strictly after account selection & popup closure
      const userCredential = await signInWithPopup(auth, provider);

      console.log(`[Auth Audit] 3. Popup closed / auth state detected timestamp=${performance.now().toFixed(2)}ms`);
      console.log(`[Auth Audit] 4. Credential received timestamp=${performance.now().toFixed(2)}ms`);
      console.log(`[Auth Audit] 5. Firebase authenticated timestamp=${performance.now().toFixed(2)}ms uid=${userCredential.user.uid}`);

      const fbUser = userCredential.user;
      const defaultName = fbUser.displayName || fbUser.email?.split("@")[0] || "Google User";
      const defaultEmail = fbUser.email || "";

      const profile: UserProfile = {
        id: fbUser.uid,
        email: defaultEmail,
        name: defaultName,
        role: "patient",
      };

      this.currentUserCache = profile;
      localStorage.setItem("careai_user", JSON.stringify(profile));
      console.log(`[Auth Audit] 7. User available timestamp=${performance.now().toFixed(2)}ms name=${profile.name}`);
      this.notifyListeners(profile);

      // Async background Firestore profile sync
      if (db) {
        (async () => {
          try {
            const docRef = doc(db, "users", fbUser.uid);
            const userDoc = await getDocFromCache(docRef).catch(() => null);
            if (!userDoc || !userDoc.exists()) {
              const serverDoc = await getDoc(docRef).catch(() => null);
              if (!serverDoc || !serverDoc.exists()) {
                await setDoc(docRef, {
                  id: fbUser.uid,
                  name: defaultName,
                  email: defaultEmail,
                  role: "patient",
                  createdAt: new Date().toISOString(),
                });
              }
            }
          } catch (e) {
            console.warn("Background Google profile creation skipped:", e);
          }
        })();
      }

      return profile;
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        throw new Error("Sign-in cancelled. Please select an account to sign in.");
      }
      console.warn("Firebase Google Sign-In failed:", err.code, err.message);
      throw new Error(err.message || "Google Sign-In failed. Please try again.");
    }
  }

  async logout(): Promise<void> {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Firebase signOut error:", err);
      }
    }
    this.currentUserCache = null;
    localStorage.removeItem("careai_user");
    this.notifyListeners(null);
    await this.localFallback.logout();
  }
}

export const authService: IAuthService = isFirebaseConfigured()
  ? new FirebaseAuthService()
  : new LocalAuthService();

