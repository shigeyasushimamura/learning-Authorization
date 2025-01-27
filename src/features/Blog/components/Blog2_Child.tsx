import { useAuth } from "../../../Authorization/models/AuthProvider";

const Blog2Child = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth();

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

export default Blog2Child;
