/**
 * Centralized API client for Science Advantage platform
 *
 * This file provides a consistent way to make API requests across the application.
 * All HTTP requests should go through this client to ensure proper error handling,
 * authentication, and response formatting.
 */

import type { ApiResponse, PaginatedResponse } from "@/lib/types";
import { handleClientError } from "@/lib/errors";

// API client configuration
interface ApiClientConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
    this.timeout = config.timeout || 10000; // 10 seconds default
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Expected JSON response, got ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        // API returned an error
        return {
          success: false,
          error: data.error?.message || data.message || "Request failed",
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
          };
        }

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  }

  // HTTP methods
  async get<T>(
    endpoint: string,
    options: Omit<RequestInit, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestInit, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestInit, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestInit, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    options: Omit<RequestInit, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string,
    params: {
      page?: number;
      limit?: number;
      [key: string]: unknown;
    } = {},
    options: Omit<RequestInit, "method" | "body"> = {}
  ): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const urlWithParams = `${endpoint}?${searchParams.toString()}`;
    const response = await this.get<T[]>(urlWithParams, options);

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Extract pagination info from response headers or data
    const pagination = {
      page: params.page || 1,
      limit: params.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return {
      success: true,
      data: response.data,
      pagination,
    };
  }

  // File upload
  async upload<T>(
    endpoint: string,
    file: File,
    options: Omit<RequestInit, "method" | "body" | "headers"> = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }

  // Update default headers
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Create default API client instance
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 15000, // 15 seconds for default client
});

// Export class for custom instances
export { ApiClient };

// Utility functions for common API patterns
export const api = {
  // Authentication
  async login(credentials: { email: string; password?: string }) {
    return apiClient.post("/auth/login", credentials);
  },

  async logout() {
    return apiClient.post("/auth/logout");
  },

  async getCurrentUser() {
    return apiClient.get("/auth/me");
  },

  // Classes
  async getClasses() {
    return apiClient.get("/classes");
  },

  async getClass(id: string) {
    return apiClient.get(`/classes/${id}`);
  },

  async createClass(data: { name: string; description?: string }) {
    return apiClient.post("/classes", data);
  },

  async updateClass(id: string, data: { name?: string; description?: string }) {
    return apiClient.patch(`/classes/${id}`, data);
  },

  async deleteClass(id: string) {
    return apiClient.delete(`/classes/${id}`);
  },

  async joinClass(joinCode: string) {
    return apiClient.post("/classes/join", { joinCode });
  },

  async leaveClass(classId: string) {
    return apiClient.post(`/classes/${classId}/leave`);
  },

  async getClassStudents(classId: string) {
    return apiClient.get(`/classes/${classId}/students`);
  },

  // Lessons
  async getLessons(params?: { unitSlug?: string; classId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.unitSlug) searchParams.append("unitSlug", params.unitSlug);
    if (params?.classId) searchParams.append("classId", params.classId);

    const query = searchParams.toString();
    return apiClient.get(`/lessons${query ? `?${query}` : ""}`);
  },

  async getLesson(id: string) {
    return apiClient.get(`/lessons/${id}`);
  },

  async getLessonBySlug(slug: string) {
    return apiClient.get(`/lessons/slug/${slug}`);
  },

  // Quizzes and Attempts
  async submitQuiz(data: { lessonId: string; responses: unknown[] }) {
    return apiClient.post("/quiz/submit", data);
  },

  async getQuizAttempts(lessonId?: string) {
    const query = lessonId ? `?lessonId=${lessonId}` : "";
    return apiClient.get(`/quiz/attempts${query}`);
  },

  // Experiments
  async submitExperiment(data: { lessonId: string; data: Record<string, unknown> }) {
    return apiClient.post("/experiments/submit", data);
  },

  async getExperimentSubmissions(lessonId?: string) {
    const query = lessonId ? `?lessonId=${lessonId}` : "";
    return apiClient.get(`/experiments/submissions${query}`);
  },

  // Progress
  async getLessonProgress(classId?: string) {
    const query = classId ? `?classId=${classId}` : "";
    return apiClient.get(`/progress/lessons${query}`);
  },

  async markLessonComplete(data: { lessonId: string; classId: string }) {
    return apiClient.post(`/progress/complete`, data);
  },

  // Utility function to handle API responses in components
  async handleRequest<T>(request: Promise<ApiResponse<T>>): Promise<{
    data?: T;
    error?: string;
    isLoading: boolean;
  }> {
    try {
      const response = await request;

      if (response.success && response.data) {
        return { data: response.data, isLoading: false };
      } else {
        return { error: response.error || "Request failed", isLoading: false };
      }
    } catch (error) {
      const clientError = handleClientError(error);
      return { error: clientError.message, isLoading: false };
    }
  },
};

// Export types for use in components
export type { ApiResponse, PaginatedResponse };
