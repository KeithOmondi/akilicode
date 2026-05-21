// hooks/useAuthInit.ts
import { useEffect, useState } from "react";
import api, { setAccessToken } from "../api/api";

// hooks/useAuthInit.ts
export function useAuthInit() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const res = await api.get("/auth/refresh");
        setAccessToken(res.data.accessToken);
      } catch {
        setAccessToken(null);
      } finally {
        setIsReady(true); // ✅ only render app after this
      }
    };
    restore();
  }, []);

  return { isReady };
}