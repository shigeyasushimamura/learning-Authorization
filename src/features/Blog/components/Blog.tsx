import useBlogAuth from "../application/useBlogAuth";
import { IAuthManager } from "../../../Authorization/IAuthManager";

// カスタムフック経由で認証処理をする場合
const Blog = () => {
  const authManager: IAuthManager = useBlogAuth();
  const { isAuthenticated, loginWithRedirect, logout } = authManager;

  return (
    <div>
      <h1>Blog</h1>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={loginWithRedirect}>Login</button>
      )}
    </div>
  );
};

export default Blog;
