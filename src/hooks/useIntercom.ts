import { useAuth } from "@/lib/auth";
import Intercom from "@intercom/messenger-js-sdk";
import { useEffect } from "react";
import { JwtPayload } from "@supabase/supabase-js";

const useIntercom = () => {
  const { session, user } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      const payload = {
        user_id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        created_at: Date.parse(user.created_at),
      };
      Intercom({
        intercom_user_jwt: session.access_token,
        app_id: "msg20icm",
        user_id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        created_at: Date.parse(user.created_at),
      });
    }
  }, [session]);
};

export default useIntercom;
