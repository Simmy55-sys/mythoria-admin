"use server";

import apiClientManager from "@/api/interface";
import { cookies } from "next/headers";

/**
 * Get cookie header string from Next.js cookies
 */
async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  const cookiePairs: string[] = [];

  cookieStore.getAll().forEach((cookie) => {
    cookiePairs.push(`${cookie.name}=${cookie.value}`);
  });

  return cookiePairs.join("; ");
}

export async function getAllTranslatorsAction() {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getTranslators(cookieHeader);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function createTranslatorAction(data: {
  username: string;
  email: string;
}) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.createTranslator(data, cookieHeader);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function toggleTranslatorStatusAction(id: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.toggleTranslatorStatus(
    id,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function deleteTranslatorAction(id: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.deleteTranslator(id, cookieHeader);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}
