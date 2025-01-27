export interface IAuthManager {
  isAuthenticated: boolean;
  loginWithRedirect: () => Promise<void>;
  getAccessTokenSilently: () => Promise<string | undefined>;
  logout: () => void;
}
