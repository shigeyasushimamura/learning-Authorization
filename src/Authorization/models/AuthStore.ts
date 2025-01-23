import * as Cookies from "es-cookie";

interface AuthResult {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}

const setCookie = (name: string, value: string): void => {
  Cookies.set(name, value);
};

const removeCookie = (name: string): void => {
  Cookies.remove(name);
};

export class AuthStore {
  SESSION_ID = "SESSION_ID";
  ID_TOKEN = "ID_TOKEN";
  ACCESS_TOKEN = "ACCESS_TOKEN";
  DECODED_ID_TOKEN = "DECODED_ID_TOKEN";
  REFRESH_TOKEN = "REFRESH_TOKEN";

  get authorization(): string | undefined {
    return Cookies.get(this.ID_TOKEN);
  }

  get accessToken(): string | undefined {
    return Cookies.get(this.ACCESS_TOKEN);
  }

  get refreshToken(): string | undefined {
    return Cookies.get(this.REFRESH_TOKEN);
  }

  removeRefreshToken(): void {
    Cookies.remove(this.REFRESH_TOKEN);
  }

  setRefreshResult(params: AuthResult): void {
    if (params.idToken !== undefined) {
      setCookie(this.ID_TOKEN, params.idToken);
    } else {
      removeCookie(this.ID_TOKEN);
    }

    if (params.accessToken !== undefined) {
      setCookie(this.ACCESS_TOKEN, params.accessToken);
    } else {
      removeCookie(this.ACCESS_TOKEN);
    }
  }
}
