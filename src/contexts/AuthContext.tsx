import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/src/firebase/config";
import type { AppUser, UserRole } from "@/src/types";

type SignUpData = {
  nome: string;
  email: string;
  senha: string;
};

type AuthContextData = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  createOwnerIfNeeded: (data: {
    uid: string;
    nome: string;
    email: string;
    role?: UserRole;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserProfile(uid: string) {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      setAppUser(null);
      return;
    }

    const data = snapshot.data();

    setAppUser({
      uid,
      nome: data.nome ?? "",
      email: data.email ?? "",
      role: (data.role ?? "viewer") as UserRole,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? undefined,
    });
  }

  async function signIn(email: string, senha: string) {
    await signInWithEmailAndPassword(auth, email.trim(), senha);
  }

  async function signUp({ nome, email, senha }: SignUpData) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      senha
    );

    if (nome.trim()) {
      await updateProfile(userCredential.user, {
        displayName: nome.trim(),
      });
    }

    await createOwnerIfNeeded({
      uid: userCredential.user.uid,
      nome: nome.trim(),
      email: email.trim(),
      role: "owner",
    });

    await loadUserProfile(userCredential.user.uid);
  }

  async function logout() {
    await signOut(auth);
  }

  async function createOwnerIfNeeded(data: {
    uid: string;
    nome: string;
    email: string;
    role?: UserRole;
  }) {
    const ref = doc(db, "users", data.uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      await setDoc(ref, {
        uid: data.uid,
        nome: data.nome,
        email: data.email,
        role: data.role ?? "owner",
        createdAt: serverTimestamp(),
      });
      return;
    }

    const currentData = snapshot.data();

    if (!currentData.role) {
      await setDoc(
        ref,
        {
          role: data.role ?? "owner",
        },
        { merge: true }
      );
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          await loadUserProfile(user.uid);
        } catch (error) {
          console.error("Erro ao carregar perfil do usuário:", error);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextData>(
    () => ({
      firebaseUser,
      appUser,
      loading,
      signIn,
      signUp,
      logout,
      createOwnerIfNeeded,
    }),
    [firebaseUser, appUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}