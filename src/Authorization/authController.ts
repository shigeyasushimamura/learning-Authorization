import { useState, useCallback, useEffect, useMemo } from "react";
import { AuthClient, HTTP_STATUS } from "./models/client/AuthClient";

const AuthController = () => {
  const initAuthClient = new AuthClient(
    "apiKey",
    "clientId",
    "authDomain",
    "redirectUrl"
  );
  const [client] = useState<AuthClient>(initAuthClient);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const verifyToken = client.verifyToken();
      const _isAuthenticated = verifyToken.status === HTTP_STATUS.OK;
      setIsAuthenticated(_isAuthenticated);
    } catch (e) {
      console.error(e);
    }
  }, [client]);

  const logout = () => {};
  const loginWithRedirect = () => {};
  const getAccessTokenSilently = () => {};

  return {
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
    client,
  };
};
