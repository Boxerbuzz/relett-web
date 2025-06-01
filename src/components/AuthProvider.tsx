"use client";

import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/lib/auth";
import { WalletProvider } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { User as AppUser } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);

      if (session?.user) {
        // Fetch or create user profile
        await fetchOrCreateUserProfile(session.user);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(() => {
          fetchOrCreateUserProfile(session.user);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateUserProfile = async (authUser: User) => {
    try {
      // First, check if user exists in our users table
      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      // If user doesn't exist, create them
      if (!userData) {
        const [first_name, ...rest] = (
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "User"
        ).split(" ");
        const last_name = rest.join(" ") || "";

        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          first_name: first_name || null,
          last_name: last_name || null,
          phone: authUser.user_metadata?.phone || null,
          user_type: authUser.user_metadata?.user_type || "landowner",
          avatar_url: authUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
        };

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single();

        if (createError) throw createError;
        userData = createdUser;

        // Create default user role
        await supabase.from("user_roles").insert([
          {
            user_id: authUser.id,
            role: newUser.user_type as any,
          },
        ]);
      }

      // Transform to AppUser type
      const appUser: AppUser = {
        id: userData.id,
        email: userData.email,
        role: userData.user_type as AppUser["role"],
        name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
        created_at: userData.created_at,
      };

      setUser(appUser);
    } catch (error) {
      console.error("Error fetching/creating user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate("/");
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "landowner" | "verifier" | "agent"
  ) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            user_type: role,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description:
            "We've sent you a confirmation link to complete your registration.",
        });
      } else {
        toast({
          title: "Welcome to LandChain!",
          description: "Your account has been created successfully.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      navigate("/auth");

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      <WalletProvider>{children}</WalletProvider>
    </AuthContext.Provider>
  );
}
