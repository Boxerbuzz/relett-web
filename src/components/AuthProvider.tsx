
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
    let isMounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (!isMounted) return;
      
      setSession(session);

      if (session?.user) {
        // Don't set loading false yet - wait for profile fetch
        await fetchOrCreateUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          setSession(session);
          await fetchOrCreateUserProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateUserProfile = async (authUser: User) => {
    try {
      console.log("Fetching user profile for:", authUser.email);
      
      // Check if we should use user_profiles table instead of users table
      // First try user_profiles table (which seems to match the hooks)
      let { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      // If user_profiles doesn't exist or fails, try users table
      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (userError && userError.code !== "PGRST116") {
        console.error("Error fetching from users table:", userError);
      }

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching from user_profiles table:", profileError);
      }

      // If user doesn't exist in users table, create them
      if (!userData) {
        console.log("Creating new user in users table");
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
          avatar: authUser.user_metadata?.avatar_url || null,
        };

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single();

        if (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }
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
        created_at: userData.created_at,
        email_confirmed_at: authUser.email_confirmed_at,
        phone: userData.phone,
      };

      console.log("Setting user:", appUser);
      setUser(appUser);
    } catch (error) {
      console.error("Error fetching/creating user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
      
      // Even on error, we should set a basic user object to avoid infinite loading
      const fallbackUser: AppUser = {
        id: authUser.id,
        email: authUser.email!,
        role: "landowner",
        created_at: new Date().toISOString(),
        email_confirmed_at: authUser.email_confirmed_at,
        phone: null,
      };
      setUser(fallbackUser);
    } finally {
      // Always set loading to false after user profile operation completes
      console.log("Setting loading to false");
      setLoading(false);
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
      // Don't set loading false here - let the auth state change handle it
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
      // Don't set loading false here - let the auth state change handle it
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
