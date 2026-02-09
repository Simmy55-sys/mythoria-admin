import { adminLoginRoute } from "@/routes/server";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { AuthResponse, LoginRequest } from "./types";

interface ApiError {
  message: string;
  statusCode?: number;
}

export type ApiResponse<T, E = ApiError> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  private requestClient: AxiosInstance;

  constructor() {
    this.requestClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      withCredentials: true, // Include cookies in all requests
    });
  }

  /**
   * Make a request to the backend server.
   *
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param data - Request data (for POST/PUT requests)
   * @param params - Query parameters
   * @param headers - request headers
   * @returns Promise resolving to API response
   */
  private async execute<T = any>(requestData: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    endpoint: string;
    data?: any;
    params?: Record<string, any>;
    headers?: AxiosRequestConfig["headers"];
  }): Promise<ApiResponse<T>> {
    const { endpoint, method, data, params, headers } = requestData;
    const url = `/${endpoint.replace(/^\//, "")}`;

    try {
      // If data is FormData, don't set Content-Type header (let browser set it with boundary)
      const requestHeaders = { ...headers };
      if (data instanceof FormData) {
        delete (requestHeaders as any)?.["Content-Type"];
      }

      const response: AxiosResponse<any> = await this.requestClient.request({
        method,
        url,
        data,
        params,
        headers: requestHeaders,
        withCredentials: true,
      });

      // Backend wraps responses in { success: true, data: ... } format
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        } as ApiResponse<T>;
      } else {
        return {
          success: false,
          error: response.data.error || {
            message: "Unknown error occurred",
            statusCode: response.status,
          },
        } as ApiResponse<T>;
      }
    } catch (err) {
      console.error(
        `An error occurred when making request to the server.`,
        err
      );

      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          err.message ||
          "Unable to complete request call.";

        return {
          success: false,
          error: {
            statusCode: err.response?.status || err.status || 0,
            message: errorMessage,
          },
        };
      }

      return {
        success: false,
        error: {
          statusCode: 0,
          message:
            err instanceof Error
              ? err.message
              : "Unable to complete request call.",
        },
      };
    }
  }

  /**
   * Execute request and return response with headers (for server actions)
   * @private
   */
  private async executeWithHeaders<T = any>(requestData: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    endpoint: string;
    data?: any;
    params?: Record<string, any>;
    headers?: AxiosRequestConfig["headers"];
  }): Promise<{ response: ApiResponse<T>; headers: Record<string, string> }> {
    const { endpoint, method, data, params, headers } = requestData;
    const url = `/${endpoint.replace(/^\//, "")}`;

    try {
      // If data is FormData, don't set Content-Type header (let browser set it with boundary)
      const requestHeaders = { ...headers };
      if (data instanceof FormData) {
        delete (requestHeaders as any)?.["Content-Type"];
      }

      const axiosResponse: AxiosResponse<any> =
        await this.requestClient.request({
          method,
          url,
          data,
          params,
          headers: requestHeaders,
          withCredentials: true,
        });

      // Convert axios headers to plain object
      const responseHeaders: Record<string, string> = {};
      Object.keys(axiosResponse.headers).forEach((key) => {
        const value = axiosResponse.headers[key];
        if (typeof value === "string") {
          responseHeaders[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          responseHeaders[key] = value.join(", ");
        }
      });

      // Backend wraps responses in { success: true, data: ... } format
      if (axiosResponse.data.success) {
        return {
          response: {
            success: true,
            data: axiosResponse.data.data,
          } as ApiResponse<T>,
          headers: responseHeaders,
        };
      } else {
        return {
          response: {
            success: false,
            error: axiosResponse.data.error || {
              message: "Unknown error occurred",
              statusCode: axiosResponse.status,
            },
          } as ApiResponse<T>,
          headers: responseHeaders,
        };
      }
    } catch (err) {
      console.error(
        `An error occurred when making request to the server.`,
        err
      );

      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          err.message ||
          "Unable to complete request call.";

        const headers: Record<string, string> = {};
        if (err.response?.headers) {
          Object.keys(err.response.headers).forEach((key) => {
            const value = err.response?.headers[key];
            if (typeof value === "string") {
              headers[key] = value;
            } else if (Array.isArray(value) && value.length > 0) {
              headers[key] = value.join(", ");
            }
          });
        }

        return {
          response: {
            success: false,
            error: {
              message: errorMessage,
              statusCode: err.response?.status,
            },
          } as ApiResponse<T>,
          headers,
        };
      }

      return {
        response: {
          success: false,
          error: {
            message: "Network error occurred",
            statusCode: 0,
          },
        } as ApiResponse<T>,
        headers: {},
      };
    }
  }

  /**
   * Login as admin
   * @param credentials - Login credentials (email and password)
   */
  async login(credentials: LoginRequest) {
    return this.execute<AuthResponse>({
      method: "POST",
      endpoint: adminLoginRoute,
      data: credentials,
    });
  }

  /**
   * Login as admin (with headers for server actions)
   * @param credentials - Login credentials (email and password)
   */
  async loginWithHeaders(credentials: LoginRequest) {
    return this.executeWithHeaders<AuthResponse>({
      method: "POST",
      endpoint: adminLoginRoute,
      data: credentials,
    });
  }

  /**
   * Get all translators
   */
  async getTranslators(cookieHeader?: string) {
    return this.execute<any[]>({
      method: "GET",
      endpoint: "/admin/translators",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Create a new translator
   * @param data - Translator data (username and email)
   */
  async createTranslator(
    data: { username: string; email: string },
    cookieHeader?: string
  ) {
    return this.execute<{
      id: string;
      username: string;
      email: string;
      password: string;
    }>({
      method: "POST",
      endpoint: "/admin/create-translator",
      data,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Toggle translator status (active/suspended)
   * @param id - Translator ID
   */
  async toggleTranslatorStatus(id: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "PATCH",
      endpoint: `/admin/translators/${id}/toggle-status`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Delete a translator
   * @param id - Translator ID
   */
  async deleteTranslator(id: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "DELETE",
      endpoint: `/admin/translators/${id}`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get all series/novels with pagination and filters
   */
  async getSeries(
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string[];
      translator?: string;
    },
    cookieHeader?: string
  ) {
    const params: Record<string, string> = {};
    
    if (options?.page) {
      params.page = options.page.toString();
    }
    if (options?.limit) {
      params.limit = options.limit.toString();
    }
    if (options?.search) {
      params.search = options.search;
    }
    if (options?.status && options.status.length > 0) {
      params.status = options.status.join(",");
    }
    if (options?.translator) {
      params.translator = options.translator;
    }

    return this.execute<{
      data: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>({
      method: "GET",
      endpoint: "/admin/series",
      params,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Delete a series/novel
   * @param id - Series ID
   */
  async deleteSeries(id: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "DELETE",
      endpoint: `/admin/series/${id}`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get chapters for a series
   * @param seriesId - Series ID
   */
  async getSeriesChapters(seriesId: string, cookieHeader?: string) {
    return this.execute<any[]>({
      method: "GET",
      endpoint: `/admin/series/${seriesId}/chapters`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get chapter content (admin can see premium content)
   * @param chapterId - Chapter ID
   */
  async getChapterContent(chapterId: string, cookieHeader?: string) {
    return this.execute<any>({
      method: "GET",
      endpoint: `/admin/chapters/${chapterId}`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Toggle chapter premium status
   * @param chapterId - Chapter ID
   */
  async toggleChapterPremium(chapterId: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "PATCH",
      endpoint: `/admin/chapters/${chapterId}/toggle-premium`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Delete a chapter
   * @param chapterId - Chapter ID
   */
  async deleteChapter(chapterId: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "DELETE",
      endpoint: `/admin/chapters/${chapterId}`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get all announcements
   */
  async getAnnouncements(cookieHeader?: string) {
    return this.execute<any[]>({
      method: "GET",
      endpoint: "/announcement",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Create an announcement
   * @param data - Announcement data
   */
  async createAnnouncement(
    data: {
      title: string;
      content: string;
      type: "info" | "warning" | "success" | "error";
      isActive: boolean;
      startDate: string;
      endDate?: string | null;
    },
    cookieHeader?: string
  ) {
    return this.execute<any>({
      method: "POST",
      endpoint: "/announcement",
      data,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Update an announcement
   * @param id - Announcement ID
   * @param data - Update data
   */
  async updateAnnouncement(
    id: string,
    data: {
      title?: string;
      content?: string;
      type?: "info" | "warning" | "success" | "error";
      isActive?: boolean;
      startDate?: string;
      endDate?: string | null;
    },
    cookieHeader?: string
  ) {
    return this.execute<any>({
      method: "PATCH",
      endpoint: `/announcement/${id}`,
      data,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Toggle announcement active status
   * @param id - Announcement ID
   */
  async toggleAnnouncementActive(id: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "PATCH",
      endpoint: `/announcement/${id}/toggle-active`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Delete an announcement
   * @param id - Announcement ID
   */
  async deleteAnnouncement(id: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "DELETE",
      endpoint: `/announcement/${id}`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Assign a series to a translator
   * @param data - Assignment data (translatorId, seriesName, adminRating)
   */
  async assignSeries(
    data: {
      translatorId: string;
      seriesName: string;
      adminRating?: number;
    },
    cookieHeader?: string
  ) {
    return this.execute<{ message: string; assignmentId: string }>({
      method: "POST",
      endpoint: "/admin/assign-series",
      data,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(cookieHeader?: string) {
    return this.execute<{
      totalNovels: number;
      totalChapters: number;
      totalTranslators: number;
      totalUsers: number;
      coinsPurchasedThisMonth: number;
    }>({
      method: "GET",
      endpoint: "/admin/statistics",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get recently purchased chapters
   */
  async getRecentPurchasedChapters(
    limit: number = 10,
    cookieHeader?: string
  ) {
    return this.execute<
      Array<{
        id: string;
        novel: string;
        chapter: string;
        purchasedBy: string;
        coinsSpent: number;
        date: string;
      }>
    >({
      method: "GET",
      endpoint: `/admin/recent-purchases?limit=${limit}`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get recent coin purchases
   */
  async getRecentCoinPurchases(limit: number = 10, cookieHeader?: string) {
    return this.execute<
      Array<{
        id: string;
        user: string;
        packageName: string;
        coinsAmount: number;
        amountPaid: string;
        date: string;
        status: "pending" | "completed" | "failed" | "cancelled";
      }>
    >({
      method: "GET",
      endpoint: `/admin/recent-coin-purchases?limit=${limit}`,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }
}

const apiClientManager = new ApiClient();
export default apiClientManager;
