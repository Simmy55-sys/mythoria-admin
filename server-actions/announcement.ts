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

export async function getAllAnnouncementsAction() {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getAnnouncements(cookieHeader);

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

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
}) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.createAnnouncement(data, cookieHeader);

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

export async function updateAnnouncementAction(
  id: string,
  data: {
    title?: string;
    content?: string;
    type?: "info" | "warning" | "success" | "error";
    isActive?: boolean;
    startDate?: string;
    endDate?: string | null;
  }
) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.updateAnnouncement(
    id,
    data,
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

export async function toggleAnnouncementActiveAction(
  id: string,
  isActive: boolean
) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.toggleAnnouncementActive(
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

export async function deleteAnnouncementAction(id: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.deleteAnnouncement(id, cookieHeader);

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

