import React from "react";
import { AuthProvider } from "../../../Authorization/models/AuthProvider";
import { IAuthManager } from "../../../Authorization/IAuthManager";

interface Props {
  children: React.ReactNode;
  authManager: IAuthManager;
}

const Blog2Parent = ({ children, authManager }: Props) => {
  return <AuthProvider authManager={authManager}>{children}</AuthProvider>;
};

export default Blog2Parent;
