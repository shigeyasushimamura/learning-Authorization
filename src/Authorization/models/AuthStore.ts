import * as Cookies from "es-cookie";
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
}
