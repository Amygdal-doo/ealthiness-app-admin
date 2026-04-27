import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "~/lib/services/api";
import { clientTokens } from "~/lib/auth/client-cookies";
import { transformApiUser } from "~/lib/auth/utils";
import type { User, LoginCredentials, ApiAuthResponse } from "~/lib/auth/types";

interface LoginResponse extends ApiAuthResponse {
  user?: User;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<LoginResponse> => {
      console.log("Login mutation called with:", credentials);

      const response = await apiClient.post<LoginResponse>(
        "/v1/auth/signin/admin",
        credentials,
      );

      console.log("Login response:", response);

      // Store tokens in cookies
      if (response.accessToken && response.refreshToken) {
        clientTokens.set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        console.log("Tokens stored in cookies");
      }

      return response;
    },
    onSuccess: () => {
      // Invalidate user query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      // Clear any existing tokens on login failure
      clientTokens.clear();
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<User | null> => {
      const tokens = clientTokens.get();
      if (!tokens) return null;

      try {
        const apiUser = await apiClient.get<any>("/v1/user/me");
        return transformApiUser(apiUser);
      } catch (error) {
        // If user fetch fails, clear tokens
        clientTokens.clear();
        return null;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear tokens from cookies
      clientTokens.clear();

      // You might want to call a logout endpoint here if your backend requires it
      // await apiClient.post('/v1/auth/logout');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (): Promise<ApiAuthResponse> => {
      const tokens = clientTokens.get();
      if (!tokens?.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.post<ApiAuthResponse>(
        "/v1/auth/refresh",
        {
          refreshToken: tokens.refreshToken,
        },
      );

      // Store new tokens
      clientTokens.set({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      return response;
    },
  });
}
