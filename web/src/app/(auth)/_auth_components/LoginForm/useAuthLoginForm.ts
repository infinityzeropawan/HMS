"use client";

import { useState } from "react";
import { AuthLoginInput } from "../../_auth_schemas/auth_login_schema";
import { authApiService } from "../../_auth_services/auth_api_service";
import { useAuthUserStore } from "../../_auth_stores/auth_user_store";

export function useAuthLoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setUserSession = useAuthUserStore((s) => s.setUserSession);
  const setMfaChallenge = useAuthUserStore((s) => s.setMfaChallenge);

  const handleLoginSubmit = async (values: AuthLoginInput) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await authApiService.login(values);
      if (response.mfaRequired && response.mfaSessionToken) {
        setMfaChallenge(response.mfaSessionToken);
      } else if (response.user && response.token) {
        setUserSession({
          ...response.user,
          token: response.token,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errorMessage,
    handleLoginSubmit,
  };
}
