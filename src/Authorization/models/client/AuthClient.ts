import { AuthStore } from "../AuthStore";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface VerifyTokenResponse {
  status: number;
}

export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
};

type Decoded = {
  [key: string]: string;
};

// jwt検証キー
export const JWT_VERIFY_KEY = {
  AUDIENCE: "aud",
  EXPIRATION: "exp",
};

interface RefreshTokenResponse {
  data?: {
    idToken?: string | undefined;
  };
  errors?: Record<string, unknown>;
}

interface initAuthResponse {
  data?: {
    isTokenRefreshed?: boolean;
    oktaRequestUri?: string;
    sessionId?: string;
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  errors?: Record<string, unknown>;
}

interface RequestAuthResponse {
  data?: {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  errors: Record<string, unknown>;
}

export class AuthClient {
  PROJECT_ID = "sample";
  authStore;
  constructor(
    private apiKey: string,
    private clientId: string,
    private authDomain: string,
    private redirectUri: string
  ) {
    this.authStore = new AuthStore();
  }

  verifyToken(): VerifyTokenResponse {
    const idToken = this.authStore.authorization;
    if (idToken === undefined) {
      return {
        status: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    // IDトークンの検証
    const decoded: Decoded = jwtDecode(idToken);

    const decodedToken = decoded[JWT_VERIFY_KEY.AUDIENCE];
    if (decodedToken !== this.clientId) {
      return {
        status: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    const exp = decoded[JWT_VERIFY_KEY.EXPIRATION];
    const currentTime = Math.floor(Date.now() / 1000); // 現在の時刻をUNIXタイムで取得
    if (Number(exp) < currentTime) {
      console.log("トークンの有効期限が切れています");
      return {
        status: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    // 全て☑済み
    return {
      status: HTTP_STATUS.OK,
    };
  }

  async getAccessToken(): Promise<string | undefined> {
    const verify = this.verifyToken();
    if (verify.status == HTTP_STATUS.OK) {
      return this.authStore.accessToken;
    }

    // const response = await this.refreshToken()
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const requestBody = {
      refreshToken: this.authStore.refreshToken,
      projectId: this.PROJECT_ID,
    };
    let response;
    try {
      // API Gateway内のリフレッシュトークン認証に成功しない場合(401など)はcatch句に入る
      response = await axios.post(
        `${this.authDomain}/refreshToken`,
        requestBody,
        {
          headers: {
            apiKey: String(
              process.env.REACT_APP_API_GATEWAY_API_KEY ?? "DUMMY_API_KEY"
            ),
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    } catch (error: unknown) {
      this.authStore.removeRefreshToken();

      if (error instanceof Error) {
        throw Error(
          `${error.message} \nリフレッシュトークンの更新に失敗しました`
        );
      }
    }
    return {
      errors: {},
      ...response,
    };
  }

  async confirmJwtAuthentication(): Promise<boolean | undefined> {
    const _isAuthenticated = false;
    const response = await this.initAuth();
  }

  async initAuth(): Promise<initAuthResponse> {
    // 画面更新時だけでなく、画面切り替わり時にもIDトークン検証をする必要があるため、
    // ここでもverifyTokenをする
    const verify = this.verifyToken();

    if (verify.status === HTTP_STATUS.UNAUTHORIZED) {
      if (this.authStore.refreshToken !== undefined) {
        const response = await this.refreshToken();
        if (response.data) {
          this.authStore.setRefreshResult(response.data);
        }

        return {
          errors: {},
          data: { isTokenRefreshed: true },
        };
      } else {
        const authResponse = await this.requestAuth();
        return authResponse;
      }
    } else {
      return {
        errors: {},
        data: {},
      };
    }
  }

  async requestAuth(): Promise<RequestAuthResponse> {
    const requestBody = {
      redirectUri: this.redirectUri,
      projectId: this.PROJECT_ID,
    };
    let response;
    try {
      response = await axios.post(`${this.authDomain}/auth`, requestBody, {
        headers: {
          apiKey: String(
            process.env.REACT_APP_API_GATEWAY_API_KEY ?? "DUMMY_API_KEY"
          ),
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw Error(`${error.message} \n認証要求でエラーが発生しました`);
      }
    }
    return {
      errors: {},
      ...response,
    };
  }
}
