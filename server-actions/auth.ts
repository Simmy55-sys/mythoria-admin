"use server";

import { cookies } from "next/headers";
import apiClientManager from "@/api/interface";
import { LoginRequest } from "@/api/types";

/**
 * Parse Set-Cookie header and extract cookie attributes
 */
function parseSetCookie(setCookieHeader: string): {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
    path?: string;
    domain?: string;
  };
} {
  const parts = setCookieHeader.split(";").map((p) => p.trim());
  const [nameValue] = parts;
  const [name, value] = nameValue.split("=");

  const options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
    path?: string;
    domain?: string;
  } = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (part === "httponly") {
      options.httpOnly = true;
    } else if (part.startsWith("secure")) {
      options.secure = true;
    } else if (part.startsWith("samesite=")) {
      const sameSiteValue = part.split("=")[1];
      if (
        sameSiteValue === "strict" ||
        sameSiteValue === "lax" ||
        sameSiteValue === "none"
      ) {
        options.sameSite = sameSiteValue;
      }
    } else if (part.startsWith("max-age=")) {
      const maxAge = parseInt(part.split("=")[1], 10);
      if (!isNaN(maxAge)) {
        options.maxAge = maxAge;
      }
    } else if (part.startsWith("path=")) {
      options.path = part.split("=")[1];
    } else if (part.startsWith("domain=")) {
      options.domain = part.split("=")[1];
    }
  }

  return { name, value, options };
}

export async function loginAction(credentials: LoginRequest) {
  const { response, headers } = await apiClientManager.loginWithHeaders(
    credentials
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  // Extract and set cookie from Set-Cookie header
  const setCookieHeader = headers["set-cookie"];
  if (setCookieHeader) {
    const cookieStore = await cookies();
    // Handle both single string and array of strings
    const cookieHeaders = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    for (const cookieHeader of cookieHeaders) {
      const cookieData = parseSetCookie(cookieHeader);
      // Only set the adminAccessToken cookie
      if (cookieData.name === "adminAccessToken") {
        cookieStore.set(cookieData.name, cookieData.value, {
          httpOnly: cookieData.options.httpOnly ?? true,
          secure: cookieData.options.secure ?? false,
          sameSite: cookieData.options.sameSite ?? "lax",
          maxAge: cookieData.options.maxAge,
          path: cookieData.options.path ?? "/",
          domain: cookieData.options.domain,
        });
        break; // Found the adminAccessToken cookie, no need to continue
      }
    }
  }

  return {
    success: true,
    data: response.data,
  } as const;
}
