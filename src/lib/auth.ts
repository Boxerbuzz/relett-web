import { createContext, useContext } from "react";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: "landowner" | "verifier" | "agent" | "user",
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
