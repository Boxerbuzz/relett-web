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
    const initAuth = async () => {
      console.log("Initializing auth - checking for existing session");
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        setUser(null);
        setLoading(false);
        setSession(null);
        return;
      }

      if (session?.user) {
        console.log("Session exists, fetching user profile...");
        await fetchOrCreateUserProfile(session.user);
        setSession(session);
      } else {
        console.log("No existing session found");
        setUser(null);
        setLoading(false);
        setSession(null);
      }
    };

    // Set up initial auth state check
    initAuth();

    // Set up listener for future auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        fetchOrCreateUserProfile(session.user);
        setSession(session);
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
        setSession(null);
      }

      if (event === "INITIAL_SESSION" && session?.user) {
        fetchOrCreateUserProfile(session.user);
        setSession(session);
      }

      if (event === "INITIAL_SESSION" && !session?.user) {
        console.log("No session, setting user to null and loading to false");
        setUser(null);
        setLoading(false);
        setSession(null);
      }
    });

    return () => {
      console.log("AuthProvider: Cleaning up");
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateUserProfile = async (authUser: User) => {
    console.log("=== STARTING fetchOrCreateUserProfile ===");
    try {
      console.log("Step 1: Fetching user profile for:", authUser.email);
      console.log("Step 2: Querying users table...");
      console.log("Querying for user ID:", authUser.id);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle(); // safer than .single()

      console.log("Step 3: Query result:", { userData, userError });

      // If there's an error and no data, treat it as a real failure
      if (userError && !userData) {
        console.error("Step 4: Error fetching from users table:", userError);
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!userData) {
        console.log("Step 5: User not found, creating new user...");

        // Try to get from dedicated fields first
        let first_name = authUser.user_metadata?.firstName;
        let last_name = authUser.user_metadata?.lastName;

        // If dedicated fields don't exist, fall back to parsing
        if (!first_name || !last_name) {
          const [parsed_first, ...rest] = (
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            "User"
          ).split(" ");

          first_name = first_name || parsed_first;
          last_name = last_name || rest.join(" ") || "";
        }

        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          first_name: first_name || null,
          last_name: last_name || null,
          phone: authUser.user_metadata?.phone || null,
          user_type: authUser.user_metadata?.user_type || "user",
          avatar: authUser.user_metadata?.avatar_url || null,
        };

        console.log("Step 6: Inserting new user:", newUser);
        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .maybeSingle(); // use maybeSingle again

        console.log("Step 7: User creation result:", {
          createdUser,
          createError,
        });

        if (createError || !createdUser) {
          console.error("Step 8: Error creating user:", createError);
          toast({
            title: "Error",
            description: "Failed to create user",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log("Step 9: Creating user role...");
        const { error: roleError } = await supabase.from("user_roles").insert([
          {
            user_id: authUser.id,
            role: newUser.user_type,
          },
        ]);

        console.log("Step 10: Role creation completed. Error:", roleError);
        if (roleError) {
          console.error("Error creating user role:", roleError);
          toast({
            title: "Error",
            description: "Failed to create user role",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log("Step 11: Setting created user as appUser");
        const appUser: AppUser = {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.user_type as AppUser["role"],
          created_at: createdUser.created_at,
          email_confirmed_at: authUser.email_confirmed_at,
          phone: createdUser.phone || undefined,
        };

        setUser(appUser);
        console.log("Step 12: Created user set successfully");
      } else {
        // User already exists
        console.log("Step 5: User found in database:", userData);
        const appUser: AppUser = {
          id: userData.id,
          email: userData.email,
          role: userData.user_type as AppUser["role"],
          created_at: userData.created_at,
          email_confirmed_at: authUser.email_confirmed_at,
          phone: userData.phone || undefined,
        };

        setUser(appUser);
        console.log("Step 6: Existing user set successfully");
      }
    } catch (error) {
      console.error("=== ERROR in fetchOrCreateUserProfile ===", error);
      toast({
        title: "Error",
        description: "Unexpected error while loading user profile",
        variant: "destructive",
      });

      const fallbackUser: AppUser = {
        id: authUser.id,
        email: authUser.email!,
        role: "landowner",
        created_at: new Date().toISOString(),
        email_confirmed_at: authUser.email_confirmed_at,
        phone: undefined,
      };

      setUser(fallbackUser);
      console.log("Fallback user set:", fallbackUser);
    } finally {
      console.log("=== FINALLY: Setting loading to false ===");
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
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
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: "landowner" | "verifier" | "agent" | "user",
    firstName: string,
    lastName: string,
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            name: `${firstName} ${lastName}`,
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
          title: "Welcome to Relett!",
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

  console.log("AuthProvider render - loading:", loading, "user:", user);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, session }}
    >
      <WalletProvider>{children}</WalletProvider>
    </AuthContext.Provider>
  );
}
