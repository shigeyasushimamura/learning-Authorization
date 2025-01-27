import { useMemo } from "react";
import AuthManager from "../../../Authorization/authManager";
import { IAuthManager } from "../../../Authorization/IAuthManager";

const useBlogAuth = (): IAuthManager => {
  // 認証ロジックの利用方法1: カスタムフックで直接認証クライアントIFを呼ぶ
  // メリット: providerと比べて依存させる対象が減る
  // デメリット：アプリ全体で認証処理が必要なら冗長
  // 結論：管理者画面とか特定ページのみで認証したいなら、この方法が良い。
  const authManager = useMemo(() => AuthManager(), []);
  return authManager;
};
export default useBlogAuth;
