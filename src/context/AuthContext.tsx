import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import { getUserData } from "../backend/firebase/services/firebase.userservice";
import { UserType } from "../backend/interfaces/UserData";

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  isPending: boolean;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Start a transition when updating user type
          startTransition(async () => {
            const userData = await getUserData(currentUser.uid);
            setUser(currentUser);
            setUserType(userData?.userType || null);
          });
        } else {
          setUser(null);
          setUserType(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        setUserType(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      userType,
      isLoading,
      isPending,
      signOut: handleSignOut,
    }),
    [user, userType, isLoading, isPending],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
