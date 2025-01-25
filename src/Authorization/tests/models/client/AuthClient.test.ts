import { expect, test, describe, beforeEach, vi, Mock } from "vitest";
import { AuthClient, HTTP_STATUS } from "../../../models/client/AuthClient";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

vi.mock("jwt-decode");
vi.mock("axios");

test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
});

describe("AuthClient", () => {
  let authClient: AuthClient;

  beforeEach(() => {
    authClient = new AuthClient("key", "id", "domain", "url");
  });

  test("verifyToken:fail authorize", () => {
    vi.spyOn(authClient.authStore, "authorization", "get").mockReturnValue(
      undefined
    );

    const result = authClient.verifyToken();
    expect(result).toEqual({ status: HTTP_STATUS.UNAUTHORIZED });
  });

  test("verifyToken:fail authorize - invalid client id", () => {
    vi.spyOn(authClient.authStore, "authorization", "get").mockReturnValue(
      "idToken"
    );

    const jwtDevodeMock = jwtDecode as Mock;
    jwtDevodeMock.mockImplementation(() => {
      return {
        aud: "invalidClientId",
      };
    });

    console.log(jwtDevodeMock);

    const result = authClient.verifyToken();
    expect(result).toEqual({ status: HTTP_STATUS.UNAUTHORIZED });
  });

  test("verifyToken:fail authorize - token expired", () => {
    vi.spyOn(authClient.authStore, "authorization", "get").mockReturnValue(
      "idToken"
    );

    const jwtDecodeMock = jwtDecode as Mock;
    jwtDecodeMock.mockImplementation(() => {
      return {
        aud: "id",
        exp: Math.floor(Date.now() / 10000),
      };
    });

    const result = authClient.verifyToken();
    expect(result).toEqual({ status: HTTP_STATUS.UNAUTHORIZED });
  });

  test("verifyToken:fail authorize - token expired", () => {
    vi.spyOn(authClient.authStore, "authorization", "get").mockReturnValue(
      "idToken"
    );

    const jwtDecodeMock = jwtDecode as Mock;

    jwtDecodeMock.mockImplementation(() => {
      return {
        aud: "id",
        exp: Math.floor(Date.now()),
      };
    });
    const result = authClient.verifyToken();
    expect(result).toEqual({ status: HTTP_STATUS.OK });
  });

  test("getAccessToken: success", async () => {
    vi.spyOn(authClient, "verifyToken").mockReturnValue({
      status: HTTP_STATUS.OK,
    });

    vi.spyOn(authClient.authStore, "accessToken", "get").mockReturnValue(
      "accessToken"
    );

    const result = await authClient.getAccessToken();
    expect(result).toEqual("accessToken");
  });

  test("getAccessToken: success ", async () => {
    vi.spyOn(authClient, "verifyToken").mockReturnValue({
      status: HTTP_STATUS.UNAUTHORIZED,
    });

    vi.spyOn(authClient, "refreshToken").mockReturnValue(
      Promise.resolve({
        data: {
          idToken: "idToken",
          accessToken: "accessToken",
          refreshToken: "refreshToken",
        },
        errors: {},
      })
    );

    const setAuthResultMock = vi.fn();
    authClient.authStore.setAuthResult = setAuthResultMock;

    vi.spyOn(authClient.authStore, "accessToken", "get").mockReturnValue(
      "accessToken"
    );

    const result = await authClient.getAccessToken();
    expect(result).toEqual("accessToken");
  });

  test("refreshToken: success", async () => {
    vi.spyOn(authClient.authStore, "refreshToken", "get").mockReturnValue(
      "refreshToken"
    );
    const axiosPostMock = vi.fn();
    axiosPostMock.mockReturnValue(
      Promise.resolve({ data: { idToken: "idToken" }, status: HTTP_STATUS.OK })
    );

    axios.post = axiosPostMock;

    const result = await authClient.refreshToken();
    expect(result).toEqual({
      errors: {},
      data: { idToken: "idToken" },
      status: HTTP_STATUS.OK,
    });
  });

  test("refreshToken: fail not connected API gateway", async () => {
    vi.spyOn(authClient.authStore, "refreshToken", "get").mockReturnValue(
      "refreshToken"
    );
    const axiosPostMock = vi.fn();
    axiosPostMock.mockImplementation(() => {
      throw new Error("refreshToken connect error");
    });
    axios.post = axiosPostMock;
    authClient.authStore.removeRefreshToken = vi.fn();

    await authClient.refreshToken().catch((e) => {
      expect(e.message).toContain("リフレッシュトークンの更新に失敗しました");
    });
  });

  test("iniAuth: success", async () => {
    vi.spyOn(authClient, "verifyToken").mockReturnValue({
      status: HTTP_STATUS.OK,
    });
    const result = await authClient.initAuth();
    expect(result).toEqual({
      errors: {},
      data: {},
    });
  });

  test("initAuth: idToken and refreshToken are invalid", async () => {
    vi.spyOn(authClient, "verifyToken").mockReturnValue({
      status: HTTP_STATUS.UNAUTHORIZED,
    });
    vi.spyOn(authClient.authStore, "refreshToken", "get").mockReturnValue(
      undefined
    );
    vi.spyOn(authClient, "requestAuth").mockReturnValue(
      Promise.resolve({
        data: {},
        errors: {},
      })
    );
    const result = await authClient.initAuth();
    expect(result).toEqual({
      data: {},
      errors: {},
    });
  });

  test("initAuth: idToken is invalid", async () => {
    vi.spyOn(authClient, "verifyToken").mockReturnValue({
      status: HTTP_STATUS.UNAUTHORIZED,
    });
    vi.spyOn(authClient.authStore, "refreshToken", "get").mockReturnValue(
      "refreshToken"
    );
    vi.spyOn(authClient, "refreshToken").mockReturnValue(
      Promise.resolve({
        data: {},
        errors: {},
      })
    );
    const setRefreshResultMock = vi.fn();
    authClient.authStore.setRefreshResult = setRefreshResultMock;

    const result = await authClient.initAuth();
    expect(result).toEqual({
      errors: {},
      data: { isTokenRefreshed: true },
    });
  });

  test("requestAuth: success", async () => {
    const axiosPostMock = vi.fn();
    axiosPostMock.mockReturnValue({ data: {} });
    axios.post = axiosPostMock;
    const result = await authClient.requestAuth();
    expect(result).toEqual({
      errors: {},
      data: {},
    });
  });

  test("requestAuth: fail", async () => {
    const axiosPostMock = vi.fn();
    axiosPostMock.mockImplementation(() => {
      throw new Error();
    });
    axios.post = axiosPostMock;
    await authClient.requestAuth().catch((e) => {
      expect(e.message).toContain("認証要求でエラーが発生しました");
    });
  });

  test("confirmJwtAuthentication: success", async () => {
    vi.spyOn(authClient, "initAuth").mockReturnValue(
      Promise.resolve({ data: {} })
    );

    const result = await authClient.confirmJwtAuthentication();
    expect(result).toEqual(true);
  });
});
