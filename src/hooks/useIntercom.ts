import { useAuth } from "@/lib/auth";
import Intercom from "@intercom/messenger-js-sdk";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const useIntercom = () => {
  const { session, user } = useAuth();
  const [intercomToken, setIntercomToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef<boolean>(false);

  useEffect(() => {
    const generateIntercomToken = async () => {
      // Prevent multiple simultaneous initialization attempts
      if (initializationRef.current) {
        console.log("Intercom initialization already in progress, skipping...");
        return;
      }

      // Only generate token once per session for each user
      if (session?.access_token && user && !isInitialized) {
        console.log("Initializing Intercom for user:", user.email);
        initializationRef.current = true;

        try {
          const { data, error } = await supabase.functions.invoke(
            "generate-intercom-token",
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (error) {
            console.error("Error generating Intercom token:", error);
            initializationRef.current = false;
            return;
          }

          if (data.success) {
            setIntercomToken(data.data.intercom_token);
            setIsInitialized(true);

            // Initialize Intercom with the secure token
            Intercom({
              intercom_user_jwt: data.data.intercom_token,
              app_id: "msg20icm",
              user_id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              created_at: Date.parse(user.created_at),
            });

            console.log("Intercom initialized successfully for:", user.email);
          }
        } catch (error) {
          console.error("Failed to generate Intercom token:", error);
          initializationRef.current = false;
        } finally {
          initializationRef.current = false;
        }
      }
    };

    // Only run if we have a user and haven't initialized yet
    if (user && !isInitialized) {
      generateIntercomToken();
    }
  }, [user?.id, session?.access_token, isInitialized]); // More specific dependencies

  // Reset initialization state when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      setIsInitialized(false);
      setIntercomToken(null);
      initializationRef.current = false;
      console.log("User logged out, resetting Intercom state");
    }
  }, [user?.id]);

  return { intercomToken, user };
};

export default useIntercom;
