import type {
  User,
  UserRole,
  AuthResult,
  ApiAuthResponse,
  UsersResponse,
  UsersQueryParams,
  RegionsQueryParams,
  CompaniesQueryParams,
  CountriesQueryParams,
  TherapySessionsQueryParams,
  PsychologistsQueryParams,
  DoctorsQueryParams,
  PatientsQueryParams,
  SessionTherapyPlansQueryParams,
} from "../auth/types";
import type { TherapyPlanItemsQueryParams } from "../therapy/therapy-item";
import type { ProductSearchQueryParams } from "../products/product";
import type { ExercisesQueryParams } from "../exercises/exercise";

const API_BASE_URL =
  "https://elathiness-backend-app-company-idea-production.up.railway.app";

// JWT payload interface for decoding tokens
interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  name?: string;
  iat: number;
  exp: number;
}

// Decode JWT token (simple base64 decode - in production use a proper JWT library)
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + "=".repeat(4 - (payload.length % 4));
    const decoded = atob(paddedPayload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/signin/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: {
            type: "invalid_credentials",
            message: "Invalid email or password",
          },
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: {
            type: "user_not_found",
            message: "No user found with this email address",
          },
        };
      }

      return {
        success: false,
        error: {
          type: "server_error",
          message: "Authentication failed. Please try again.",
        },
      };
    }

    const data: ApiAuthResponse = await response.json();

    // Decode the access token to get user information
    const userPayload = decodeJWT(data.accessToken);
    if (!userPayload) {
      return {
        success: false,
        error: {
          type: "server_error",
          message: "Invalid token received from server",
        },
      };
    }

    // Create user object from JWT payload
    const user: User = {
      id: userPayload.sub,
      firstName:
        userPayload.name?.split(" ")[0] || userPayload.email.split("@")[0],
      lastName: userPayload.name?.split(" ")[1] || "",
      username: userPayload.email.split("@")[0],
      email: [userPayload.email],
      roles: [userPayload.role],
      currentRole: userPayload.role,
      companies: [],
      adminCountries: [],
      adminRegions: [],
      adminCompanies: [],
      diet: { breakfast: [], lunch: [], dinner: [] },
      coins: 0,
      friends: [],
      blockList: [],
      settings: {
        stretching: false,
        dailyMood: false,
        drinkWater: false,
        quotes: { send: false, minutes: 0 },
        facts: { send: false, minutes: 0 },
      },
      accomplishments: [],
      rating: 0,
      reviews: 0,
      price: 0,
      currency: "usd",
      coaches: [],
      coachTrainees: [],
      coachGroup: [],
      coachGroupMember: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
      isFollowingDiet: false,
      activeDietPlanId: null,
      activeUserDietPlanId: null,
      currentDayNumber: null,
      // Computed properties for backwards compatibility

      name: userPayload.name || userPayload.email.split("@")[0],
      role: userPayload.role,
    };

    return {
      success: true,
      user,
      tokens: data,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: {
        type: "server_error",
        message: "Network error. Please check your connection and try again.",
      },
    };
  }
}

export async function getUserById(id: string): Promise<User | null> {
  // This would typically make an API call to fetch user details
  // For now, we'll return null as we don't have this endpoint info
  console.warn("getUserById not implemented for API");
  return null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // This would typically make an API call to fetch user details
  // For now, we'll return null as we don't have this endpoint info
  console.warn("getUserByEmail not implemented for API");
  return null;
}

export async function refreshAuthToken(
  refreshToken: string,
): Promise<ApiAuthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data: ApiAuthResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

// Helper function to get user from access token
export function getUserFromToken(accessToken: string): User | null {
  const payload = decodeJWT(accessToken);
  if (!payload) return null;

  return {
    id: payload.sub,
    firstName: payload.name?.split(" ")[0] || payload.email.split("@")[0],
    lastName: payload.name?.split(" ")[1] || "",
    username: payload.email.split("@")[0],
    email: [payload.email],
    roles: [payload.role],
    currentRole: payload.role,
    companies: [],
    adminCountries: [],
    adminRegions: [],
    adminCompanies: [],
    diet: { breakfast: [], lunch: [], dinner: [] },
    coins: 0,
    friends: [],
    blockList: [],
    settings: {
      stretching: false,
      dailyMood: false,
      drinkWater: false,
      quotes: { send: false, minutes: 0 },
      facts: { send: false, minutes: 0 },
    },
    accomplishments: [],
    rating: 0,
    reviews: 0,
    price: 0,
    currency: "usd",
    coaches: [],
    coachTrainees: [],
    coachGroup: [],
    coachGroupMember: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
    isFollowingDiet: false,
    activeDietPlanId: null,
    activeUserDietPlanId: null,
    currentDayNumber: null,
    // Computed properties for backwards compatibility

    name: payload.name || payload.email.split("@")[0],
    role: payload.role,
  };
}

/**
 * Builds the query string for users endpoint
 */
export function buildUsersQueryString(params: UsersQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();

  return `/v1/admin/users${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the endpoint for getting user details by ID
 */
export function buildUserDetailsEndpoint(userId: string): string {
  return `/v1/admin/users/${userId}`;
}

/**
 * Builds the query string for the psychologists endpoint
 */
export function buildPsychologistsQueryString(
  params: PsychologistsQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/psychologist${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for the doctors endpoint
 */
export function buildDoctorsQueryString(
  params: DoctorsQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/doctor${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for regions endpoint
 */
export function buildRegionsQueryString(
  params: RegionsQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/region${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for companies endpoint
 */
export function buildCompaniesQueryString(
  params: CompaniesQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/company${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for countries endpoint
 */
export function buildCountriesQueryString(
  params: CountriesQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/country${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the endpoint for getting country details by ID
 */
export function buildCountryDetailsEndpoint(countryId: string): string {
  return `/v1/country/${countryId}`;
}

/**
 * Builds the endpoint for getting region details by ID
 */
export function buildRegionDetailsEndpoint(regionId: string): string {
  return `/v1/region/${regionId}/stats`;
}

/**
 * Builds the endpoint for getting company details by ID
 */
export function buildCompanyDetailsEndpoint(companyId: string): string {
  return `/v1/company/${companyId}`;
}

/**
 * Builds the query string for region users endpoint
 */
export function buildRegionUsersQueryString(
  regionId: string,
  params: UsersQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/region/${regionId}/users${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for country users endpoint
 */
export function buildCountryUsersQueryString(
  countryId: string,
  params: UsersQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/country/${countryId}/users${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for company users endpoint
 */
export function buildCompanyUsersQueryString(
  companyId: string,
  params: UsersQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  if (params.userType) {
    searchParams.append("userType", params.userType);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/company/${companyId}/users${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for region countries endpoint
 */
export function buildRegionCountriesQueryString(
  regionId: string,
  params: CountriesQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/region/${regionId}/countries${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for region companies endpoint
 */
export function buildRegionCompaniesQueryString(
  regionId: string,
  params: CompaniesQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/region/${regionId}/companies${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for country companies endpoint
 */
export function buildCountryCompaniesQueryString(
  countryId: string,
  params: CompaniesQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  // Add parameters only if they have values
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  if (params.orderBy) {
    searchParams.append("orderBy", params.orderBy);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  const queryString = searchParams.toString();
  return `/v1/admin/country/${countryId}/companies${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for the authenticated psychologist's therapy sessions
 */
export function buildPsychologistSessionsQueryString(
  params: TherapySessionsQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.order) {
    searchParams.append("order", params.order);
  }

  if (params.search) {
    searchParams.append("search", params.search);
  }

  const queryString = searchParams.toString();
  return `/v1/therapy-sessions/psychologist/all${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the endpoint for getting a single therapy session by ID
 */
export function buildSessionDetailsEndpoint(sessionId: string): string {
  return `/v1/therapy-sessions/${sessionId}`;
}

/**
 * Builds the endpoint for updating a therapy session's doctor notes
 */
export function buildSessionNotesEndpoint(sessionId: string): string {
  return `/v1/therapy-sessions/${sessionId}/notes`;
}

/**
 * Builds the endpoint for generating a therapy session's summary audio
 */
export function buildSessionSummaryAudioEndpoint(sessionId: string): string {
  return `/v1/therapy-sessions/${sessionId}/summary-audio`;
}

/**
 * Builds the endpoint for creating a therapy plan
 */
export function buildTherapyPlanEndpoint(): string {
  return `/v1/therapy-plan`;
}

/**
 * Builds the endpoint for getting a single therapy plan by ID
 * (still used for deleting a plan by id).
 */
export function buildTherapyPlanDetailsEndpoint(planId: string): string {
  return `/v1/therapy-plan/${planId}`;
}

/**
 * Builds the endpoint for listing a session's therapy plans, with optional
 * pagination and status filter (active / draft / completed / cancelled).
 */
export function buildSessionTherapyPlansQueryString(
  sessionId: string,
  params: SessionTherapyPlansQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.status) {
    searchParams.append("status", params.status);
  }

  const queryString = searchParams.toString();
  return `/v1/therapy-plan/session/${sessionId}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the endpoint for listing a therapy plan's items, with optional
 * pagination and type / status filters.
 */
export function buildTherapyPlanItemsQueryString(
  planId: string,
  params: TherapyPlanItemsQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  if (params.status) {
    searchParams.append("status", params.status);
  }

  const queryString = searchParams.toString();
  return `/v1/therapy-plan/${planId}/items${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the endpoint for creating a new item within a therapy plan.
 */
export function buildTherapyPlanItemCreateEndpoint(planId: string): string {
  return `/v1/therapy-plan/${planId}/items`;
}

/**
 * Builds the endpoint for deleting a single item from a therapy plan.
 */
export function buildTherapyPlanItemDeleteEndpoint(
  planId: string,
  itemId: string,
): string {
  return `/v1/therapy-plan/${planId}/items/${itemId}`;
}

/**
 * Builds the query string for the exercise pagination endpoint.
 * Empty filters are omitted so "no filter" means all exercises.
 */
export function buildExercisesQueryString(
  params: ExercisesQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.name && params.name.trim()) {
    searchParams.append("name", params.name.trim());
  }

  if (params.level) {
    searchParams.append("level", params.level);
  }

  if (params.body_part) {
    searchParams.append("body_part", params.body_part);
  }

  const queryString = searchParams.toString();
  return `/v2/exercise/pagination${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for the product search endpoint.
 */
export function buildProductSearchQueryString(
  params: ProductSearchQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.search && params.search.trim()) {
    searchParams.append("search", params.search.trim());
  }

  const queryString = searchParams.toString();
  return `/v1/products/search${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the endpoint for getting a single patient by ID
 */
export function buildPatientDetailsEndpoint(patientId: string): string {
  return `/v1/therapy-sessions/patients/${patientId}`;
}

/**
 * Builds the query string for a single patient's therapy sessions
 */
export function buildPatientSessionsQueryString(
  patientId: string,
  params: TherapySessionsQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.order) {
    searchParams.append("order", params.order);
  }

  const queryString = searchParams.toString();
  return `/v1/therapy-sessions/psychologist/patient/${patientId}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Builds the query string for the authenticated psychologist's patients
 */
export function buildPatientsQueryString(
  params: PatientsQueryParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  if (params.scope) {
    searchParams.append("scope", params.scope);
  }

  if (params.search) {
    searchParams.append("search", params.search);
  }

  const queryString = searchParams.toString();
  return `/v1/therapy-sessions/patients${queryString ? `?${queryString}` : ""}`;
}
