import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiClient } from "~/lib/services/api";
import { clientTokens } from "~/lib/auth/client-cookies";
import { transformApiUser } from "~/lib/auth/utils";
import {
  buildUsersQueryString,
  buildUserDetailsEndpoint,
  buildRegionsQueryString,
  buildCompaniesQueryString,
  buildCountriesQueryString,
  buildCountryDetailsEndpoint,
  buildRegionDetailsEndpoint,
  buildCompanyDetailsEndpoint,
  buildRegionUsersQueryString,
  buildCountryUsersQueryString,
  buildCompanyUsersQueryString,
  buildRegionCountriesQueryString,
  buildRegionCompaniesQueryString,
  buildCountryCompaniesQueryString,
  buildPractitionerSessionsQueryString,
  buildSessionDetailsEndpoint,
  buildSessionNotesEndpoint,
  buildSessionSummaryAudioEndpoint,
  buildPatientDetailsEndpoint,
  buildPatientSessionsQueryString,
  buildPsychologistsQueryString,
  buildCompanyPsychologistsQueryString,
  buildDoctorsQueryString,
  buildCompanyDoctorsQueryString,
  buildHospitalsQueryString,
  buildHospitalDetailsEndpoint,
  buildPatientsQueryString,
  buildTherapyPlanEndpoint,
  buildTherapyPlanDetailsEndpoint,
  buildSessionTherapyPlansQueryString,
  buildTherapyPlanItemsQueryString,
  buildTherapyPlanItemCreateEndpoint,
  buildTherapyPlanItemDeleteEndpoint,
  buildProductSearchQueryString,
  buildExercisesQueryString,
} from "~/lib/services/user.service";
import type {
  TherapyPlanItemsResponse,
  TherapyPlanItemsQueryParams,
  TherapyPlanItem,
} from "~/lib/therapy/therapy-item";
import {
  PRODUCT_SEARCH_MIN_CHARS,
  type ProductSearchResponse,
  type ProductSearchQueryParams,
} from "~/lib/products/product";
import type {
  ExercisesResponse,
  ExercisesQueryParams,
  Exercise,
  CreateExercisePayload,
  UpdateExercisePayload,
} from "~/lib/exercises/exercise";
import type {
  DietPlan,
  DietPlanDetailResponse,
  CreateDietPlanPayload,
  UpdateDietPlanPayload,
  CreateMealPayload,
  UpdateMealPayload,
  DietPlanMeal,
} from "~/lib/diet-plans/diet-plan";
import type {
  User,
  LoginCredentials,
  ApiAuthResponse,
  UsersResponse,
  UsersQueryParams,
  ApiUser,
  RegionsResponse,
  RegionsQueryParams,
  CompaniesResponse,
  CompaniesQueryParams,
  CountriesResponse,
  CountriesQueryParams,
  ApiCountry,
  ApiRegion,
  ApiCompany,
  DashboardOverview,
  DashboardPeriod,
  TherapySessionDetail,
  TherapySessionsResponse,
  TherapySessionsQueryParams,
  PsychologistsResponse,
  PsychologistsQueryParams,
  CompanyPsychologistsResponse,
  CompanyPsychologistsQueryParams,
  DoctorsResponse,
  DoctorsQueryParams,
  CompanyDoctorsResponse,
  CompanyDoctorsQueryParams,
  ApiHospital,
  ApiHospitalDoctor,
  ApiHospitalPsychologist,
  HospitalsResponse,
  HospitalsQueryParams,
  CreateHospitalPayload,
  UpdateHospitalPayload,
  ApiPatient,
  PatientsResponse,
  PatientsQueryParams,
  PsychologistDashboardOverview,
  DoctorDashboardOverview,
  PatientMoodEntry,
  TtsGrokVoice,
  CreateTherapyPlanPayload,
  UpdateTherapyPlanPayload,
  TherapyPlan,
  TherapyPlansResponse,
  SessionTherapyPlansQueryParams,
} from "~/lib/auth/types";
import type { PractitionerApiRole } from "~/lib/portal";

interface LoginResponse extends ApiAuthResponse {
  user?: User;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>(
        "/v1/auth/signin/admin",
        credentials,
      );

      // Store tokens in cookies
      if (response.accessToken && response.refreshToken) {
        clientTokens.set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
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

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string): Promise<{ message: string }> => {
      const response = await apiClient.post<{ message: string }>(
        "/v1/user/forgot-password",
        { email },
      );

      // If response is empty, return a default success message
      return response && Object.keys(response).length > 0
        ? response
        : { message: "Password reset instructions sent successfully" };
    },
  });
}

export function useUsers(params: UsersQueryParams = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async (): Promise<UsersResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildUsersQueryString(params);
        const response = await apiClient.get<UsersResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<ApiUser> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildUserDetailsEndpoint(userId);
        const response = await apiClient.get<ApiUser>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching user details:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!userId, // Only run if we have tokens and userId
  });
}

export function usePsychologists(
  params: PsychologistsQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["psychologists", params],
    queryFn: async (): Promise<PsychologistsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildPsychologistsQueryString(params);
        const response = await apiClient.get<PsychologistsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching psychologists:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (options.enabled ?? true) && !!clientTokens.get(), // Only run if we have tokens
  });
}

// Company-scoped psychologists list (usable by COMPANY_ADMIN). Results are
// normalized to the ApiPsychologist shape (_id -> id) so consumers can treat
// both psychologist endpoints interchangeably.
export function useCompanyPsychologists(
  companyId: string,
  params: CompanyPsychologistsQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["company-psychologists", companyId, params],
    queryFn: async (): Promise<PsychologistsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCompanyPsychologistsQueryString(
          companyId,
          params,
        );
        const response =
          await apiClient.get<CompanyPsychologistsResponse>(endpoint);
        return {
          ...response,
          results: response.results.map(({ _id, ...psychologist }) => ({
            ...psychologist,
            id: _id,
            profileImage: psychologist.profileImage ?? null,
          })),
        };
      } catch (error) {
        console.error("Error fetching company psychologists:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (options.enabled ?? true) && !!companyId && !!clientTokens.get(),
  });
}

export function useDoctors(
  params: DoctorsQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async (): Promise<DoctorsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildDoctorsQueryString(params);
        const response = await apiClient.get<DoctorsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching doctors:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (options.enabled ?? true) && !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useHospitals(params: HospitalsQueryParams = {}) {
  return useQuery({
    queryKey: ["hospitals", params],
    queryFn: async (): Promise<HospitalsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildHospitalsQueryString(params);
        const response = await apiClient.get<HospitalsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useHospitalDetails(
  hospitalId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["hospital", hospitalId],
    queryFn: async (): Promise<ApiHospital> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildHospitalDetailsEndpoint(hospitalId);
        const response = await apiClient.get<ApiHospital>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching hospital details:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (options.enabled ?? true) && !!clientTokens.get() && !!hospitalId, // Only run if we have tokens and hospitalId
  });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHospitalPayload): Promise<ApiHospital> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.post<ApiHospital>(
          "/v1/hospital",
          payload,
        );
        return response;
      } catch (error) {
        console.error("Error creating hospital:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hospitalId,
      data,
    }: {
      hospitalId: string;
      data: UpdateHospitalPayload;
    }): Promise<ApiHospital> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildHospitalDetailsEndpoint(hospitalId);
        const response = await apiClient.put<ApiHospital>(endpoint, data);
        return response;
      } catch (error) {
        console.error("Error updating hospital:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital", variables.hospitalId],
      });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useHospitalDoctors(
  hospitalId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["hospital-doctors", hospitalId],
    queryFn: async (): Promise<ApiHospitalDoctor[]> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.get<ApiHospitalDoctor[]>(
          `/v1/hospital/${hospitalId}/doctors`,
        );
        return response;
      } catch (error) {
        console.error("Error fetching hospital doctors:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (options.enabled ?? true) && !!clientTokens.get() && !!hospitalId, // Only run if we have tokens and hospitalId
  });
}

export function useHospitalPsychologists(
  hospitalId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["hospital-psychologists", hospitalId],
    queryFn: async (): Promise<ApiHospitalPsychologist[]> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.get<ApiHospitalPsychologist[]>(
          `/v1/hospital/${hospitalId}/psychologists`,
        );
        return response;
      } catch (error) {
        console.error("Error fetching hospital psychologists:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (options.enabled ?? true) && !!clientTokens.get() && !!hospitalId, // Only run if we have tokens and hospitalId
  });
}

export function useAddDoctorToHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hospitalId,
      doctorId,
    }: {
      hospitalId: string;
      doctorId: string;
    }): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        await apiClient.post<void>(
          `/v1/hospital/${hospitalId}/doctors/${doctorId}`,
        );
      } catch (error) {
        console.error("Error adding doctor to hospital:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital", variables.hospitalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospital-doctors", variables.hospitalId],
      });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useAddPsychologistToHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hospitalId,
      psychologistId,
    }: {
      hospitalId: string;
      psychologistId: string;
    }): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        await apiClient.post<void>(
          `/v1/hospital/${hospitalId}/psychologists/${psychologistId}`,
        );
      } catch (error) {
        console.error("Error adding psychologist to hospital:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital", variables.hospitalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospital-psychologists", variables.hospitalId],
      });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useRemovePsychologistFromHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hospitalId,
      psychologistId,
    }: {
      hospitalId: string;
      psychologistId: string;
    }): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        await apiClient.delete<void>(
          `/v1/hospital/${hospitalId}/psychologists/${psychologistId}`,
        );
      } catch (error) {
        console.error("Error removing psychologist from hospital:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital", variables.hospitalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospital-psychologists", variables.hospitalId],
      });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useRemoveDoctorFromHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hospitalId,
      doctorId,
    }: {
      hospitalId: string;
      doctorId: string;
    }): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        await apiClient.delete<void>(
          `/v1/hospital/${hospitalId}/doctors/${doctorId}`,
        );
      } catch (error) {
        console.error("Error removing doctor from hospital:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital", variables.hospitalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospital-doctors", variables.hospitalId],
      });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hospitalId: string): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildHospitalDetailsEndpoint(hospitalId);
        await apiClient.delete<void>(endpoint);
      } catch (error) {
        console.error("Error deleting hospital:", error);
        throw error;
      }
    },
    onSuccess: (_data, hospitalId) => {
      queryClient.removeQueries({ queryKey: ["hospital", hospitalId] });
      queryClient.removeQueries({ queryKey: ["hospital-doctors", hospitalId] });
      queryClient.removeQueries({
        queryKey: ["hospital-psychologists", hospitalId],
      });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

// Company-scoped doctors list (usable by COMPANY_ADMIN). Results are
// normalized to the ApiDoctor shape (_id -> id) so consumers can treat
// both doctor endpoints interchangeably.
export function useCompanyDoctors(
  companyId: string,
  params: CompanyDoctorsQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["company-doctors", companyId, params],
    queryFn: async (): Promise<DoctorsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCompanyDoctorsQueryString(companyId, params);
        const response = await apiClient.get<CompanyDoctorsResponse>(endpoint);
        return {
          ...response,
          results: response.results.map(({ _id, ...doctor }) => ({
            ...doctor,
            id: _id,
            profileImage: doctor.profileImage ?? null,
          })),
        };
      } catch (error) {
        console.error("Error fetching company doctors:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (options.enabled ?? true) && !!companyId && !!clientTokens.get(),
  });
}

export function useRegions(params: RegionsQueryParams = {}) {
  return useQuery({
    queryKey: ["regions", params],
    queryFn: async (): Promise<RegionsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildRegionsQueryString(params);
        const response = await apiClient.get<RegionsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useCompanies(params: CompaniesQueryParams = {}) {
  return useQuery({
    queryKey: ["companies", params],
    queryFn: async (): Promise<CompaniesResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCompaniesQueryString(params);
        const response = await apiClient.get<CompaniesResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useCountries(params: CountriesQueryParams = {}) {
  return useQuery({
    queryKey: ["countries", params],
    queryFn: async (): Promise<CountriesResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCountriesQueryString(params);
        const response = await apiClient.get<CountriesResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching countries:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useCountryDetails(countryId: string) {
  return useQuery({
    queryKey: ["country", countryId],
    queryFn: async (): Promise<ApiCountry> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCountryDetailsEndpoint(countryId);
        const response = await apiClient.get<ApiCountry>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching country details:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!countryId, // Only run if we have tokens and countryId
  });
}

export function useRegionDetails(regionId: string) {
  return useQuery({
    queryKey: ["region", regionId],
    queryFn: async (): Promise<ApiRegion> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildRegionDetailsEndpoint(regionId);
        const response = await apiClient.get<ApiRegion>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching region details:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!regionId, // Only run if we have tokens and regionId
  });
}

export function useUpdateRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      regionId,
      data,
    }: {
      regionId: string;
      data: {
        name?: string;
        image?: File;
      };
    }): Promise<ApiRegion> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildRegionDetailsEndpoint(regionId);

        // Use FormData if there's a file, otherwise JSON
        if (data.image) {
          const formData = new FormData();
          if (data.name) formData.append("name", data.name);
          formData.append("image", data.image);

          const response = await apiClient.put<ApiRegion>(endpoint, formData);
          return response;
        } else {
          // Filter out undefined values and image
          const cleanData = Object.entries(data)
            .filter(([key, value]) => value !== undefined && key !== "image")
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

          const response = await apiClient.put<ApiRegion>(endpoint, cleanData);
          return response;
        }
      } catch (error) {
        console.error("Error updating region:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch region details
      queryClient.invalidateQueries({
        queryKey: ["region", variables.regionId],
      });
      // Invalidate regions list as well
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

export function useUpdateCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      countryId,
      data,
    }: {
      countryId: string;
      data: {
        name?: string;
        regionId?: string;
        alpha2?: string;
        alpha3?: string;
        flag?: File;
      };
    }): Promise<ApiCountry> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCountryDetailsEndpoint(countryId);

        // Use FormData if there's a file, otherwise JSON
        if (data.flag) {
          const formData = new FormData();
          if (data.name) formData.append("name", data.name);
          if (data.regionId) formData.append("regionId", data.regionId);
          if (data.alpha2) formData.append("alpha2", data.alpha2);
          if (data.alpha3) formData.append("alpha3", data.alpha3);
          formData.append("flag", data.flag);

          const response = await apiClient.put<ApiCountry>(endpoint, formData);
          return response;
        } else {
          // Filter out undefined values and flag
          const cleanData = Object.entries(data)
            .filter(([key, value]) => value !== undefined && key !== "flag")
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

          const response = await apiClient.put<ApiCountry>(endpoint, cleanData);
          return response;
        }
      } catch (error) {
        console.error("Error updating country:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch country details
      queryClient.invalidateQueries({
        queryKey: ["country", variables.countryId],
      });
      // Invalidate countries list as well
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });
}

export function useInviteCountryAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      countryId,
      email,
    }: {
      countryId: string;
      email: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/country/${countryId}/invite?email=${encodeURIComponent(email)}`;
        const response = await apiClient.post<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error inviting country admin:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch country details to update admin list
      queryClient.invalidateQueries({
        queryKey: ["country", variables.countryId],
      });
    },
  });
}

export function useInvitePsychologist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
    }: {
      email: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/psychologist/invite`;
        const response = await apiClient.post<{ message: string }>(endpoint, {
          email,
        });
        return response;
      } catch (error) {
        console.error("Error inviting psychologist:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate psychologists list once it is backed by a real API.
      queryClient.invalidateQueries({ queryKey: ["psychologists"] });
    },
  });
}

export function useInviteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
    }: {
      email: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/doctor/invite`;
        const response = await apiClient.post<{ message: string }>(endpoint, {
          email,
        });
        return response;
      } catch (error) {
        console.error("Error inviting doctor:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useInviteRegionAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      regionId,
      email,
    }: {
      regionId: string;
      email: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/region/${regionId}/invite?email=${encodeURIComponent(email)}`;
        const response = await apiClient.post<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error inviting region admin:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch region details to update admin list
      queryClient.invalidateQueries({
        queryKey: ["region", variables.regionId],
      });
      // Invalidate regions list as well
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

export function useInviteCompanyAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      email,
    }: {
      companyId: string;
      email: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/company/${companyId}/invite?email=${encodeURIComponent(email)}`;
        const response = await apiClient.post<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error inviting company admin:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch company details to update admin list
      queryClient.invalidateQueries({
        queryKey: ["company", variables.companyId],
      });
      // Invalidate companies list as well
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useInviteCompanyEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      email,
    }: {
      companyId: string;
      email: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/company/${companyId}/invite?email=${encodeURIComponent(email)}`;
        const response = await apiClient.post<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error inviting company employee:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch company details to update employee list
      queryClient.invalidateQueries({
        queryKey: ["company", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["company-users", variables.companyId],
      });
      // Invalidate companies list as well
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useInvitePsychologistToCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      psychologistId,
      asCompanyAdmin,
    }: {
      companyId: string;
      psychologistId: string;
      asCompanyAdmin?: boolean;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // Company admins invite via the invite route (psychologistId in body);
        // super admins keep the direct assignment route.
        const response = asCompanyAdmin
          ? await apiClient.post<{ message: string }>(
              `/v1/admin/psychologist/company/${companyId}/invite`,
              { psychologistId },
            )
          : await apiClient.post<{ message: string }>(
              `/v1/admin/psychologist/company/${companyId}/psychologist/${psychologistId}`,
            );
        return response;
      } catch (error) {
        console.error("Error inviting psychologist to company:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch company details to update psychologist list
      queryClient.invalidateQueries({
        queryKey: ["company", variables.companyId],
      });
      // Invalidate companies list as well
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({
        queryKey: ["company-psychologists", variables.companyId],
      });
    },
  });
}

export function useInviteDoctorToCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      doctorId,
      asCompanyAdmin,
    }: {
      companyId: string;
      doctorId: string;
      asCompanyAdmin?: boolean;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // Company admins invite via the invite route (doctorId in body);
        // super admins keep the direct assignment route.
        const response = asCompanyAdmin
          ? await apiClient.post<{ message: string }>(
              `/v1/admin/doctor/company/${companyId}/invite`,
              { doctorId },
            )
          : await apiClient.post<{ message: string }>(
              `/v1/admin/doctor/company/${companyId}/doctor/${doctorId}`,
            );
        return response;
      } catch (error) {
        console.error("Error inviting doctor to company:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch company details to update doctor list
      queryClient.invalidateQueries({
        queryKey: ["company", variables.companyId],
      });
      // Invalidate companies list as well
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({
        queryKey: ["company-doctors", variables.companyId],
      });
    },
  });
}

export function useCompanyDetails(companyId: string) {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async (): Promise<ApiCompany> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCompanyDetailsEndpoint(companyId);
        const response = await apiClient.get<ApiCompany>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching company details:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!companyId, // Only run if we have tokens and companyId
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: string;
      data: {
        name?: string;
        email?: string;
        address?: string;
        logo?: File;
      };
    }): Promise<ApiCompany> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCompanyDetailsEndpoint(companyId);

        // Use FormData if there's a file, otherwise JSON
        if (data.logo) {
          const formData = new FormData();
          if (data.name) formData.append("name", data.name);
          if (data.email) formData.append("email", data.email);
          if (data.address) formData.append("address", data.address);
          formData.append("logo", data.logo);

          const response = await apiClient.put<ApiCompany>(endpoint, formData);
          return response;
        } else {
          // Filter out undefined values and logo
          const cleanData = Object.entries(data)
            .filter(([key, value]) => value !== undefined && key !== "logo")
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

          const response = await apiClient.put<ApiCompany>(endpoint, cleanData);
          return response;
        }
      } catch (error) {
        console.error("Error updating company:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch company details
      queryClient.invalidateQueries({
        queryKey: ["company", variables.companyId],
      });
      // Invalidate companies list as well
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useRegionUsers(
  regionId: string,
  params: UsersQueryParams = {},
) {
  return useQuery({
    queryKey: ["region-users", regionId, params],
    queryFn: async (): Promise<UsersResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildRegionUsersQueryString(regionId, params);
        const response = await apiClient.get<UsersResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching region users:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!regionId, // Only run if we have tokens and regionId
  });
}

export function useRegionCountries(
  regionId: string,
  params: CountriesQueryParams = {},
) {
  return useQuery({
    queryKey: ["region-countries", regionId, params],
    queryFn: async (): Promise<CountriesResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildRegionCountriesQueryString(regionId, params);
        const response = await apiClient.get<CountriesResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching region countries:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!regionId, // Only run if we have tokens and regionId
  });
}

export function useRegionCompanies(
  regionId: string,
  params: CompaniesQueryParams = {},
) {
  return useQuery({
    queryKey: ["region-companies", regionId, params],
    queryFn: async (): Promise<CompaniesResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildRegionCompaniesQueryString(regionId, params);
        const response = await apiClient.get<CompaniesResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching region companies:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!regionId, // Only run if we have tokens and regionId
  });
}

export function useCountryCompanies(
  countryId: string,
  params: CompaniesQueryParams = {},
) {
  return useQuery({
    queryKey: ["country-companies", countryId, params],
    queryFn: async (): Promise<CompaniesResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCountryCompaniesQueryString(countryId, params);
        const response = await apiClient.get<CompaniesResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching country companies:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!countryId, // Only run if we have tokens and countryId
  });
}

export function useCountryUsers(
  countryId: string,
  params: UsersQueryParams = {},
) {
  return useQuery({
    queryKey: ["country-users", countryId, params],
    queryFn: async (): Promise<UsersResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCountryUsersQueryString(countryId, params);
        const response = await apiClient.get<UsersResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching country users:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!countryId, // Only run if we have tokens and countryId
  });
}

export function useCompanyUsers(
  companyId: string,
  params: UsersQueryParams = {},
) {
  return useQuery({
    queryKey: ["company-users", companyId, params],
    queryFn: async (): Promise<UsersResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildCompanyUsersQueryString(companyId, params);
        const response = await apiClient.get<UsersResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching company users:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!companyId, // Only run if we have tokens and companyId
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/users/${userId}`;
        const response = await apiClient.delete<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all user-related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["region-users"] });
      queryClient.invalidateQueries({ queryKey: ["country-users"] });
      queryClient.invalidateQueries({ queryKey: ["company-employees"] });
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
  });
}

export function useRemoveRegionalAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      regionId,
      userId,
    }: {
      regionId: string;
      userId: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/region/deallocate/admin?regionId=${regionId}&userId=${userId}`;
        const response = await apiClient.put<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error removing regional admin role:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate region users to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ["region-users", variables.regionId],
      });
      // Invalidate region details
      queryClient.invalidateQueries({
        queryKey: ["region", variables.regionId],
      });
    },
  });
}

export function useRemoveCountryAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      countryId,
      userId,
    }: {
      countryId: string;
      userId: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/country/deallocate/admin?countryId=${countryId}&userId=${userId}`;
        const response = await apiClient.put<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error removing country admin role:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate country users to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ["country-users", variables.countryId],
      });
      // Invalidate country details
      queryClient.invalidateQueries({
        queryKey: ["country", variables.countryId],
      });
    },
  });
}

export function useRemoveCompanyAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      userId,
    }: {
      companyId: string;
      userId: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/admin/company/deallocate/admin?companyId=${companyId}&userId=${userId}`;
        const response = await apiClient.put<{ message: string }>(endpoint);
        return response;
      } catch (error) {
        console.error("Error removing company admin role:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate company  users to trigger refetch

      queryClient.invalidateQueries({
        queryKey: ["company-users", variables.companyId],
      });
      // Invalidate company details
      queryClient.invalidateQueries({
        queryKey: ["company", variables.companyId],
      });
    },
  });
}

export function useDashboardOverview(period?: DashboardPeriod) {
  return useQuery({
    queryKey: ["dashboard-overview", period],
    queryFn: async (): Promise<DashboardOverview> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const queryParams = period ? `?period=${period}` : "";
        const endpoint = `/v1/admin/dashboard/overview${queryParams}`;
        const response = await apiClient.get<DashboardOverview>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function usePractitionerSessions(
  role: PractitionerApiRole,
  params: TherapySessionsQueryParams = {},
) {
  return useQuery({
    queryKey: ["practitioner-sessions", role, params],
    queryFn: async (): Promise<TherapySessionsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildPractitionerSessionsQueryString(role, params);
        const response = await apiClient.get<TherapySessionsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching practitioner sessions:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function usePsychologistDashboardOverview() {
  return useQuery({
    queryKey: ["psychologist-dashboard-overview"],
    queryFn: async (): Promise<PsychologistDashboardOverview> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = "/v1/dashboard/psychologist/overview";
        const response =
          await apiClient.get<PsychologistDashboardOverview>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching psychologist dashboard overview:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useDoctorDashboardOverview() {
  return useQuery({
    queryKey: ["doctor-dashboard-overview"],
    queryFn: async (): Promise<DoctorDashboardOverview> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = "/v1/dashboard/doctor/overview";
        const response = await apiClient.get<DoctorDashboardOverview>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching doctor dashboard overview:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function usePsychologistSession(sessionId: string) {
  return useQuery({
    queryKey: ["therapy-session", sessionId],
    queryFn: async (): Promise<TherapySessionDetail> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildSessionDetailsEndpoint(sessionId);
        const response = await apiClient.get<TherapySessionDetail>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching therapy session:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!sessionId, // Only run if we have tokens and sessionId
  });
}

export function useGenerateSummaryAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      voice,
      force = false,
    }: {
      sessionId: string;
      voice: TtsGrokVoice;
      force?: boolean;
    }): Promise<TherapySessionDetail> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildSessionSummaryAudioEndpoint(sessionId);
        const response = await apiClient.post<TherapySessionDetail>(endpoint, {
          voice,
          force,
        });
        return response;
      } catch (error) {
        console.error("Error generating summary audio:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Update the cached session immediately so polling picks up the new status
      if (data && data.id) {
        queryClient.setQueryData(
          ["therapy-session", variables.sessionId],
          data,
        );
      }
      queryClient.invalidateQueries({
        queryKey: ["therapy-session", variables.sessionId],
      });
    },
  });
}

export function usePsychologistPatients(params: PatientsQueryParams = {}) {
  return useQuery({
    queryKey: ["psychologist-patients", params],
    queryFn: async (): Promise<PatientsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildPatientsQueryString(params);
        const response = await apiClient.get<PatientsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching patients:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useUpdateSessionNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      doctorNotes,
    }: {
      sessionId: string;
      doctorNotes: string;
    }): Promise<TherapySessionDetail> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildSessionNotesEndpoint(sessionId);
        const response = await apiClient.patch<TherapySessionDetail>(endpoint, {
          doctorNotes,
        });
        return response;
      } catch (error) {
        console.error("Error updating session notes:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Update the cached session immediately and refetch lists
      queryClient.setQueryData(["therapy-session", variables.sessionId], data);
      queryClient.invalidateQueries({
        queryKey: ["therapy-session", variables.sessionId],
      });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildSessionDetailsEndpoint(sessionId);
        await apiClient.delete<void>(endpoint);
      } catch (error) {
        console.error("Error deleting session:", error);
        throw error;
      }
    },
    onSuccess: (_data, sessionId) => {
      // Drop the deleted session's cache and refresh any session lists
      queryClient.removeQueries({ queryKey: ["therapy-session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["practitioner-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["patient-sessions"] });
    },
  });
}

export function usePsychologistPatient(patientId: string) {
  return useQuery({
    queryKey: ["therapy-patient", patientId],
    queryFn: async (): Promise<ApiPatient> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildPatientDetailsEndpoint(patientId);
        const response = await apiClient.get<ApiPatient>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching patient details:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!patientId, // Only run if we have tokens and patientId
  });
}

// Errors from apiClient are plain `ApiError` objects carrying the HTTP status.
const isNotFoundError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { status?: number }).status === 404;

export function usePatientRecentMood(
  role: PractitionerApiRole,
  patientId: string,
) {
  return useQuery({
    // `null` is a valid result here: the patient simply has no recorded mood.
    queryKey: ["patient-recent-mood", role, patientId],
    queryFn: async (): Promise<PatientMoodEntry | null> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = `/v1/mental/${role}/patient/${patientId}/recent`;
        const response = await apiClient.get<PatientMoodEntry | null>(endpoint);
        // No mood entry is an expected state — the API may answer with an empty
        // body or an object without an `id`. Normalize all of these to `null`
        // so callers can distinguish "no mood" from a real fetch error.
        if (!response || !response.id) {
          return null;
        }
        return response;
      } catch (error) {
        // A 404 means the patient has no recent mood — treat it as empty, not
        // as an error, so the UI shows the soft empty state instead of a retry.
        if (isNotFoundError(error)) {
          return null;
        }
        console.error("Error fetching patient recent mood:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens, or if the patient simply has no mood (404).
      return (
        failureCount < 2 && !!clientTokens.get() && !isNotFoundError(error)
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!patientId, // Only run if we have tokens and patientId
  });
}

export function usePatientSessions(
  role: PractitionerApiRole,
  patientId: string,
  params: TherapySessionsQueryParams = {},
) {
  return useQuery({
    queryKey: ["patient-sessions", role, patientId, params],
    queryFn: async (): Promise<TherapySessionsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildPatientSessionsQueryString(
          role,
          patientId,
          params,
        );
        const response = await apiClient.get<TherapySessionsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching patient sessions:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!patientId, // Only run if we have tokens and patientId
  });
}

export function useScopedDashboardOverview(period?: DashboardPeriod) {
  return useQuery({
    queryKey: ["scoped-dashboard-overview", period],
    queryFn: async (): Promise<DashboardOverview> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const queryParams = period ? `?period=${period}` : "";
        const endpoint = `/v1/admin/dashboard/scoped/overview${queryParams}`;
        const response = await apiClient.get<DashboardOverview>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching scoped dashboard overview:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if no tokens or auth error
      return failureCount < 2 && !!clientTokens.get();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(), // Only run if we have tokens
  });
}

export function useSessionTherapyPlans(
  sessionId: string,
  params: SessionTherapyPlansQueryParams = {},
) {
  return useQuery({
    queryKey: ["therapy-plans", sessionId, params],
    queryFn: async (): Promise<TherapyPlansResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildSessionTherapyPlansQueryString(sessionId, params);
        const response = await apiClient.get<TherapyPlansResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching session therapy plans:", error);
        throw error;
      }
    },
    retry: (failureCount) => failureCount < 2 && !!clientTokens.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!sessionId, // Only run when we have a session id
  });
}

export function useTherapyPlanItems(
  planId: string,
  params: TherapyPlanItemsQueryParams = {},
) {
  return useQuery({
    queryKey: ["therapy-plan-items", planId, params],
    queryFn: async (): Promise<TherapyPlanItemsResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildTherapyPlanItemsQueryString(planId, params);
        const response =
          await apiClient.get<TherapyPlanItemsResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching therapy plan items:", error);
        throw error;
      }
    },
    retry: (failureCount) => failureCount < 2 && !!clientTokens.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!planId, // Only run when we have a plan id
  });
}

export function useAddTherapyPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      item,
    }: {
      planId: string;
      item: Record<string, unknown>;
    }): Promise<TherapyPlanItem> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildTherapyPlanItemCreateEndpoint(planId);
        const response = await apiClient.post<TherapyPlanItem>(endpoint, item);
        return response;
      } catch (error) {
        console.error("Error adding therapy plan item:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Refresh the plan's item list to include the newly added item.
      queryClient.invalidateQueries({
        queryKey: ["therapy-plan-items", variables.planId],
      });
    },
  });
}

export function useDeleteTherapyPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      itemId,
    }: {
      planId: string;
      itemId: string;
    }): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildTherapyPlanItemDeleteEndpoint(planId, itemId);
        await apiClient.delete<void>(endpoint);
      } catch (error) {
        console.error("Error deleting therapy plan item:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Refresh the plan's item list now that one is gone.
      queryClient.invalidateQueries({
        queryKey: ["therapy-plan-items", variables.planId],
      });
    },
  });
}

export function useCreateTherapyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateTherapyPlanPayload,
    ): Promise<TherapyPlan> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildTherapyPlanEndpoint();
        const response = await apiClient.post<TherapyPlan>(endpoint, payload);
        return response;
      } catch (error) {
        console.error("Error creating therapy plan:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Refresh any views scoped to this session.
      queryClient.invalidateQueries({
        queryKey: ["therapy-plans", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["therapy-session", variables.sessionId],
      });
    },
  });
}

export function useUpdateTherapyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      data,
    }: {
      planId: string;
      data: UpdateTherapyPlanPayload;
    }): Promise<TherapyPlan> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildTherapyPlanDetailsEndpoint(planId);
        const response = await apiClient.patch<TherapyPlan>(endpoint, data);
        return response;
      } catch (error) {
        console.error("Error updating therapy plan:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh any plan lists so the edited plan reflects its new values.
      queryClient.invalidateQueries({ queryKey: ["therapy-plans"] });
    },
  });
}

export function useDeleteTherapyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildTherapyPlanDetailsEndpoint(planId);
        await apiClient.delete<void>(endpoint);
      } catch (error) {
        console.error("Error deleting therapy plan:", error);
        throw error;
      }
    },
    onSuccess: (_data, planId) => {
      // Drop the deleted plan's caches; the session must be refetched by the
      // caller so its `therapyPlan` reference clears.
      queryClient.removeQueries({ queryKey: ["therapy-plan", planId] });
      queryClient.removeQueries({ queryKey: ["therapy-plan-items", planId] });
      queryClient.invalidateQueries({ queryKey: ["therapy-plans"] });
    },
  });
}

/**
 * Searches the product catalog. The query only fires once the (trimmed) search
 * term reaches {@link PRODUCT_SEARCH_MIN_CHARS} characters — callers are
 * expected to pass an already-debounced term. Previous results are kept while
 * paginating so the list doesn't flash between pages.
 */
export function useProductSearch(params: ProductSearchQueryParams = {}) {
  const search = params.search?.trim() ?? "";
  const canSearch = search.length >= PRODUCT_SEARCH_MIN_CHARS;

  return useQuery({
    queryKey: ["product-search", params],
    queryFn: async (): Promise<ProductSearchResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildProductSearchQueryString(params);
        const response = await apiClient.get<ProductSearchResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error searching products:", error);
        throw error;
      }
    },
    retry: (failureCount) => failureCount < 2 && !!clientTokens.get(),
    staleTime: 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
    // Only hit the API once we have tokens and enough characters to search.
    enabled: !!clientTokens.get() && canSearch,
  });
}

export function useExercises(params: ExercisesQueryParams = {}) {
  return useQuery({
    queryKey: ["exercises", params],
    queryFn: async (): Promise<ExercisesResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const endpoint = buildExercisesQueryString(params);
        const response = await apiClient.get<ExercisesResponse>(endpoint);
        return response;
      } catch (error) {
        console.error("Error fetching exercises:", error);
        throw error;
      }
    },
    retry: (failureCount) => failureCount < 2 && !!clientTokens.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
    enabled: !!clientTokens.get(),
  });
}

/**
 * Fetches the diet plans created by the current super admin.
 * GET /v1/diet-plan/me/created returns a plain array of plans.
 */
export function useCreatedDietPlans() {
  return useQuery({
    queryKey: ["diet-plans", "me", "created"],
    queryFn: async (): Promise<DietPlan[]> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.get<DietPlan[]>(
          "/v1/diet-plan/me/created",
        );
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching created diet plans:", error);
        throw error;
      }
    },
    retry: (failureCount) => failureCount < 2 && !!clientTokens.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get(),
  });
}

export function useCreateDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDietPlanPayload): Promise<DietPlan> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // Always create the plan with a JSON body so nested values (e.g.
        // `macros`) reach the backend as real objects. A multipart request
        // would flatten `macros` into a string, which the backend drops.
        const { image, ...rest } = payload;
        const body = Object.fromEntries(
          Object.entries(rest).filter(([, value]) => value !== undefined),
        );

        const created = await apiClient.post<DietPlan>("/v1/diet-plan", body);

        // If a cover image was supplied, upload it in a follow-up multipart
        // update — that call carries no nested fields, so nothing is lost.
        if (image && created?.id) {
          const formData = new FormData();
          formData.append("image", image);

          const withImage = await apiClient.put<DietPlan>(
            `/v1/diet-plan/${created.id}`,
            formData,
          );
          return withImage;
        }

        return created;
      } catch (error) {
        console.error("Error creating diet plan:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the created-plans list so the new plan shows up.
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
    },
  });
}

/**
 * Updates a diet plan.
 * PUT /v1/diet-plan/:id (multipart/form-data so the cover image can be
 * replaced). Only the fields present in `data` are sent.
 */
export function useUpdateDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dietPlanId,
      data,
    }: {
      dietPlanId: string;
      data: UpdateDietPlanPayload;
    }): Promise<DietPlan> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // When an image is attached we must send multipart/form-data. In that
        // case nested values like `macros` have to be JSON-encoded strings.
        if (data.image) {
          const formData = new FormData();
          if (data.title !== undefined) {
            formData.append("title", data.title);
          }
          if (data.description !== undefined) {
            formData.append("description", data.description);
          }
          if (data.goal !== undefined) {
            formData.append("goal", data.goal);
          }
          if (data.dailyCalorieTarget !== undefined) {
            formData.append(
              "dailyCalorieTarget",
              data.dailyCalorieTarget.toString(),
            );
          }
          if (data.macros !== undefined) {
            formData.append("macros", JSON.stringify(data.macros));
          }
          if (data.durationDays !== undefined) {
            formData.append("durationDays", data.durationDays.toString());
          }
          if (data.restrictions !== undefined) {
            data.restrictions.forEach((restriction) =>
              formData.append("restrictions", restriction),
            );
          }
          if (data.visibility !== undefined) {
            formData.append("visibility", data.visibility);
          }
          if (data.isFree !== undefined) {
            formData.append("isFree", data.isFree ? "true" : "false");
          }
          if (data.price !== undefined) {
            formData.append("price", data.price.toString());
          }
          if (data.currency !== undefined) {
            formData.append("currency", data.currency);
          }
          if (data.coachGroup !== undefined) {
            formData.append("coachGroup", data.coachGroup);
          }
          formData.append("image", data.image);

          const response = await apiClient.put<DietPlan>(
            `/v1/diet-plan/${dietPlanId}`,
            formData,
          );
          return response;
        }

        // No image: send a plain JSON body so nested values (e.g. `macros`)
        // reach the backend as real objects rather than strings.
        const { image: _image, ...rest } = data;
        const body = Object.fromEntries(
          Object.entries(rest).filter(([, value]) => value !== undefined),
        );

        const response = await apiClient.put<DietPlan>(
          `/v1/diet-plan/${dietPlanId}`,
          body,
        );
        return response;
      } catch (error) {
        console.error("Error updating diet plan:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Refresh the plan detail and the created-plans list.
      queryClient.invalidateQueries({
        queryKey: ["diet-plan", variables.dietPlanId],
      });
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
    },
  });
}

/**
 * Adds a meal to a diet plan.
 * POST /v1/diet-plan/:id/meals (multipart/form-data for the optional image).
 */
export function useAddDietPlanMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dietPlanId,
      data,
    }: {
      dietPlanId: string;
      data: CreateMealPayload;
    }): Promise<DietPlanMeal> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // Always create the meal with a JSON body so nested values (e.g.
        // `foodItems`) reach the backend as real objects. A multipart request
        // would flatten `foodItems` into a string, which the backend drops.
        const { image, ...rest } = data;
        const body = Object.fromEntries(
          Object.entries(rest).filter(([, value]) => value !== undefined),
        );

        const created = await apiClient.post<DietPlanMeal>(
          `/v1/diet-plan/${dietPlanId}/meals`,
          body,
        );

        // If an image was supplied, upload it in a follow-up multipart update —
        // that call carries no nested fields, so nothing is lost.
        if (image && created?.id) {
          const formData = new FormData();
          formData.append("image", image);

          const withImage = await apiClient.put<DietPlanMeal>(
            `/v1/diet-plan/${dietPlanId}/meals/${created.id}`,
            formData,
          );
          return withImage;
        }

        return created;
      } catch (error) {
        console.error("Error adding meal to diet plan:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Refresh the plan detail so the new meal shows up.
      queryClient.invalidateQueries({
        queryKey: ["diet-plan", variables.dietPlanId],
      });
    },
  });
}

/**
 * Updates a meal on a diet plan.
 * PUT /v1/diet-plan/:id/meals/:mealId (multipart/form-data so the meal image
 * can be replaced). Only the fields present in `data` are sent.
 */
export function useUpdateDietPlanMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dietPlanId,
      mealId,
      data,
    }: {
      dietPlanId: string;
      mealId: string;
      data: UpdateMealPayload;
    }): Promise<DietPlanMeal> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // When an image is attached we must send multipart/form-data. In that
        // case nested values like `foodItems` have to be JSON-encoded strings.
        if (data.image) {
          const formData = new FormData();
          if (data.dayNumber !== undefined) {
            formData.append("dayNumber", data.dayNumber.toString());
          }
          if (data.mealType !== undefined) {
            formData.append("mealType", data.mealType);
          }
          if (data.title !== undefined) {
            formData.append("title", data.title);
          }
          if (data.description !== undefined) {
            formData.append("description", data.description);
          }
          if (data.ingredients !== undefined) {
            data.ingredients.forEach((ingredient) =>
              formData.append("ingredients", ingredient),
            );
          }
          if (data.foodItems !== undefined) {
            formData.append("foodItems", JSON.stringify(data.foodItems));
          }
          if (data.calories !== undefined) {
            formData.append("calories", data.calories.toString());
          }
          if (data.protein !== undefined) {
            formData.append("protein", data.protein.toString());
          }
          if (data.carbs !== undefined) {
            formData.append("carbs", data.carbs.toString());
          }
          if (data.fat !== undefined) {
            formData.append("fat", data.fat.toString());
          }
          if (data.order !== undefined) {
            formData.append("order", data.order.toString());
          }
          formData.append("image", data.image);

          const response = await apiClient.put<DietPlanMeal>(
            `/v1/diet-plan/${dietPlanId}/meals/${mealId}`,
            formData,
          );
          return response;
        }

        // No image: send a plain JSON body so nested values (e.g. `foodItems`)
        // reach the backend as real objects rather than strings.
        const { image: _image, ...rest } = data;
        const body = Object.fromEntries(
          Object.entries(rest).filter(([, value]) => value !== undefined),
        );

        const response = await apiClient.put<DietPlanMeal>(
          `/v1/diet-plan/${dietPlanId}/meals/${mealId}`,
          body,
        );
        return response;
      } catch (error) {
        console.error("Error updating meal on diet plan:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Refresh the plan detail so the edited meal shows up.
      queryClient.invalidateQueries({
        queryKey: ["diet-plan", variables.dietPlanId],
      });
    },
  });
}

/**
 * Deletes a meal from a diet plan.
 * DELETE /v1/diet-plan/:id/meals/:mealId
 */
export function useDeleteDietPlanMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dietPlanId,
      mealId,
    }: {
      dietPlanId: string;
      mealId: string;
    }): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.delete<{ message: string }>(
          `/v1/diet-plan/${dietPlanId}/meals/${mealId}`,
        );
        return response;
      } catch (error) {
        console.error("Error deleting meal from diet plan:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Refresh the plan detail so the deleted meal disappears.
      queryClient.invalidateQueries({
        queryKey: ["diet-plan", variables.dietPlanId],
      });
    },
  });
}

/**
 * Fetches a single diet plan with its meals.
 * GET /v1/diet-plan/:id returns `{ plan, meals }`.
 */
export function useDietPlan(dietPlanId: string) {
  return useQuery({
    queryKey: ["diet-plan", dietPlanId],
    queryFn: async (): Promise<DietPlanDetailResponse> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.get<DietPlanDetailResponse>(
          `/v1/diet-plan/${dietPlanId}`,
        );
        return response;
      } catch (error) {
        console.error("Error fetching diet plan:", error);
        throw error;
      }
    },
    retry: (failureCount) => failureCount < 2 && !!clientTokens.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!dietPlanId,
  });
}

export function useDeleteDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dietPlanId: string): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.delete<{ message: string }>(
          `/v1/diet-plan/${dietPlanId}`,
        );
        return response;
      } catch (error) {
        console.error("Error deleting diet plan:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the created-plans list. The detail query is disabled by the
      // caller before navigating away, so we don't remove it here.
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
    },
  });
}

export function useExercise(exerciseId: string) {
  return useQuery({
    queryKey: ["exercise", exerciseId],
    queryFn: async (): Promise<Exercise> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.get<Exercise>(
          `/v1/exercise/${exerciseId}`,
        );
        return response;
      } catch (error) {
        console.error("Error fetching exercise:", error);
        throw error;
      }
    },
    retry: (failureCount) => failureCount < 2 && !!clientTokens.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clientTokens.get() && !!exerciseId,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExercisePayload): Promise<Exercise> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // The endpoint accepts image/video files, so send multipart/form-data.
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("force", payload.force);
        formData.append("category", payload.category);
        formData.append("mechanic", payload.mechanic);
        formData.append("equipment", payload.equipment);
        formData.append("level", payload.level);

        payload.instructions.forEach((instruction) =>
          formData.append("instructions", instruction),
        );
        payload.primaryMuscles.forEach((muscle) =>
          formData.append("primaryMuscles", muscle),
        );
        payload.secondaryMuscles.forEach((muscle) =>
          formData.append("secondaryMuscles", muscle),
        );
        payload.images.forEach((image) => formData.append("images", image));
        payload.videos.forEach((video) => formData.append("videos", video));

        const response = await apiClient.post<Exercise>(
          "/v1/exercise",
          formData,
        );
        return response;
      } catch (error) {
        console.error("Error creating exercise:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the exercise catalog so the new exercise shows up.
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      data,
    }: {
      exerciseId: string;
      data: UpdateExercisePayload;
    }): Promise<Exercise> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // Images/videos are not editable here, so a plain JSON body is enough.
        const response = await apiClient.put<Exercise>(
          `/v1/exercise/${exerciseId}`,
          data,
        );
        return response;
      } catch (error) {
        console.error("Error updating exercise:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exercise", variables.exerciseId],
      });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useUpdateExerciseImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      images,
    }: {
      exerciseId: string;
      images: File[];
    }): Promise<Exercise> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // Image files are uploaded as multipart/form-data under `images`.
        const formData = new FormData();
        images.forEach((image) => formData.append("images", image));

        const response = await apiClient.put<Exercise>(
          `/v1/exercise/${exerciseId}/images`,
          formData,
        );
        return response;
      } catch (error) {
        console.error("Error updating exercise images:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exercise", variables.exerciseId],
      });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useUpdateExerciseVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      videos,
    }: {
      exerciseId: string;
      videos: File[];
    }): Promise<Exercise> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        // Video files are uploaded as multipart/form-data under `videos`.
        const formData = new FormData();
        videos.forEach((video) => formData.append("videos", video));

        const response = await apiClient.put<Exercise>(
          `/v1/exercise/${exerciseId}/videos`,
          formData,
        );
        return response;
      } catch (error) {
        console.error("Error updating exercise videos:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exercise", variables.exerciseId],
      });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string): Promise<{ message: string }> => {
      const tokens = clientTokens.get();
      if (!tokens) {
        throw new Error("No access token available");
      }

      try {
        const response = await apiClient.delete<{ message: string }>(
          `/v1/exercise/${exerciseId}`,
        );
        return response;
      } catch (error) {
        console.error("Error deleting exercise:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the catalog. The detail query is disabled by the caller before
      // navigating away, so we avoid removing it here (removing an active query
      // would trigger an immediate refetch of the now-deleted exercise).
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}
