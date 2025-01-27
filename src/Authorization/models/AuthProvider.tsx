import { createContext, ReactNode, useContext } from "react";
import { IAuthManager } from "../IAuthManager";

interface AuthProviderProps {
  authManager: IAuthManager;
  children: ReactNode;
}

const AuthContext = createContext<IAuthManager | undefined>(undefined);

export const AuthProvider = ({ authManager, children }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={authManager}>{children}</AuthContext.Provider>
  );
};

// コンポーネント側が呼び出したいときはこの関数を利用
export const useAuth = (): IAuthManager => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth should be require AuthProvider");
  }
  return context;
};
