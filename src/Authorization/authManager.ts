import { useState, useCallback, useEffect } from "react";
import { AuthClient, HTTP_STATUS } from "./models/client/AuthClient";
import { IAuthManager } from "./IAuthManager";

const AuthManager = (): IAuthManager => {
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
  }, []);

  const logout = useCallback(() => {
    try {
      client.removeAllToken();
      // 必要応じてhistoryをlogout画面用のパスに変更
    } catch (e) {
      console.error(e);
    }
  }, [client]);
  const loginWithRedirect = useCallback(async () => {
    try {
      const _isAuthenticated = await client.confirmJwtAuthentication();
      if (_isAuthenticated) {
        setIsAuthenticated(_isAuthenticated);
      }
    } catch (e) {
      console.error(e);
    }
  }, [client]);
  const getAccessTokenSilently = async () => {
    try {
      const accessToken = await client.getAccessToken();
      if (!accessToken) {
        throw new Error("AccessToken is undefined");
      }

      return accessToken;
    } catch (e) {
      console.error(e);
    }
  };

  return {
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
  };
};

export default AuthManager;
