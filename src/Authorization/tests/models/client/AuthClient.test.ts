import { expect, test, describe, beforeEach, vi } from "vitest";
import { AuthClient, HTTP_STATUS } from "../../../models/client/AuthClient";
import { jwtDecode } from "jwt-decode";

vi.mock("jwt-decode");

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

    const jwtDevodeMock = jwtDecode as vi.Mock;
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

    const jwtDecodeMock = jwtDecode as vi.mock;
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

    const jwtDecodeMock = jwtDecode as vi.mock;
    jwtDecodeMock.mockImplementation(() => {
      return {
        aud: "id",
        exp: Math.floor(Date.now()),
      };
    });

    const result = authClient.verifyToken();
    expect(result).toEqual({ status: HTTP_STATUS.OK });
  });
});
