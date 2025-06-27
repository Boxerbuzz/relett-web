import { useAuth } from "@/lib/auth";
import Intercom from "@intercom/messenger-js-sdk";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const useIntercom = () => {
  const { session, user } = useAuth();
  const [intercomToken, setIntercomToken] = useState<string | null>(null);

  useEffect(() => {
    const generateIntercomToken = async () => {
      if (session?.access_token && user) {
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
            return;
          }

          if (data.success) {
            setIntercomToken(data.data.intercom_token);

            // Initialize Intercom with the secure token
            Intercom({
              intercom_user_jwt: data.data.intercom_token,
              app_id: "msg20icm",
              user_id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              created_at: Date.parse(user.created_at),
            });
          }
        } catch (error) {
          console.error("Failed to generate Intercom token:", error);
        }
      }
    };

    if (user) {
      generateIntercomToken();
    }
  }, [user]);

  return { intercomToken, user };
};

export default useIntercom;
