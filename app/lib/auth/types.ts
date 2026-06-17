export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string[];
  roles: string[];
  currentRole: UserRole;
  companies: any[];
  adminCountries: any[];
  adminRegions: any[];
  adminCompanies: any[];
  diet: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
  };
  coins: number;
  friends: any[];
  blockList: any[];
  settings: {
    stretching: boolean;
    dailyMood: boolean;
    drinkWater: boolean;
    quotes: {
      send: boolean;
      minutes: number;
    };
    facts: {
      send: boolean;
      minutes: number;
    };
  };
  accomplishments: any[];
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  coaches: any[];
  coachTrainees: any[];
  coachGroup: any[];
  coachGroupMember: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  curency?: string;
  isFollowingDiet: boolean;
  activeDietPlanId: any;
  activeUserDietPlanId: any;
  currentDayNumber: any;

  // Computed properties for backwards compatibility

  name: string;
  role: UserRole;
}

export type UserRole =
  | "COMPANY_ADMIN"
  | "REGIONAL_ADMIN"
  | "COUNTRY_ADMIN"
  | "SUPER_ADMIN"
  | "PSYCHOLOGIST"
  | "USER";

export interface Session {
  userId: string;
  user: User;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  type:
    | "invalid_credentials"
    | "user_not_found"
    | "session_expired"
    | "unauthorized"
    | "server_error";
  message: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: ApiAuthResponse;
  error?: AuthError;
  redirectTo?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageCompanies: boolean;
  canManageRegions: boolean;
  canManageCountries: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
}

export const USER_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  SUPER_ADMIN: {
    canManageUsers: true,
    canManageCompanies: true,
    canManageRegions: true,
    canManageCountries: true,
    canViewAnalytics: true,
    canManageSystem: true,
  },
  COUNTRY_ADMIN: {
    canManageUsers: true,
    canManageCompanies: true,
    canManageRegions: true,
    canManageCountries: false,
    canViewAnalytics: true,
    canManageSystem: false,
  },
  REGIONAL_ADMIN: {
    canManageUsers: true,
    canManageCompanies: true,
    canManageRegions: true,
    canManageCountries: true,
    canViewAnalytics: true,
    canManageSystem: false,
  },
  COMPANY_ADMIN: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageRegions: false,
    canManageCountries: false,
    canViewAnalytics: true,
    canManageSystem: false,
  },
  PSYCHOLOGIST: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageRegions: false,
    canManageCountries: false,
    canViewAnalytics: false,
    canManageSystem: false,
  },
  USER: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageRegions: false,
    canManageCountries: false,
    canViewAnalytics: false,
    canManageSystem: false,
  },
};

// Users API types
export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string[];
  roles: string[];
  height?: number;
  weight?: number;
  gender?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: ApiUser[];
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: "firstName" | "lastName" | "email" | "username" | "birthdate";
  type?: "ascending" | "descending";
  userRole?: UserRole;
  userType?: "all" | "admins" | "employees";
}

// Psychologists API types
export interface ApiPsychologist {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string[];
  profileImage: string | null;
  roles: string[];
  country?: string;
  patientsCount: number;
  companiesCount: number;
  createdAt: string;
}

export interface PsychologistsResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: ApiPsychologist[];
}

export interface PsychologistsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: "firstName" | "lastName" | "email" | "username" | "birthdate";
  type?: "ascending" | "descending";
}

// Regions API types
export interface ApiRegion {
  id: string;
  name: string;
  __v: number;
  admins: any[];
  createdAt: string;
  image: {
    name: string;
    extension: string;
    createdAt: string;
    url: string;
  } | null;
  updatedAt: string;
  adminCount?: number; // Optional since it's calculated from admins array
  countryCount: number; // New field from /stats endpoint
  companyCount: number; // New field from /stats endpoint
  userCount: number; // New field from /stats endpoint
}

export interface RegionsResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: ApiRegion[];
}

export interface RegionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: "name" | "createdAt";
  type?: "ascending" | "descending";
}

// Companies API types
export interface ApiCompany {
  id: string;
  name: string;
  email: string;
  address: string;
  countryId: string;
  logo: {
    name: string;
    extension: string;
    createdAt: string;
    url: string;
    id: string;
  } | null;
  status: string;
  employees: string[];
  admins: string[];
  assignmentList: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  // New fields from /stats endpoint
  country?: {
    id: string;
    name: string;
    alpha2: string;
    alpha3: string;
    region: {
      id: string;
      name: string;
    };
  };
  userCount?: number;
  adminCount?: number; // Optional since it's calculated from admins array
}

export interface CompaniesResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: ApiCompany[];
}

export interface CompaniesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: "name" | "createdAt";
  type?: "ascending" | "descending";
}

// Countries API types
export interface ApiCountry {
  id: string;
  alpha2: string;
  alpha3: string;
  name: string;
  numericId: number;
  regionId?: string; // Legacy field, may still be present
  admins: string[];
  flag: {
    name: string;
    extension: string;
    createdAt: string;
    url: string;
    id: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  // New fields from /stat endpoint
  region: {
    id: string;
    name: string;
    __v: number;
    admins: any[];
    createdAt: string;
    image: any;
    updatedAt: string;
  };
  companyCount: number;
  userCount: number;
  adminCount?: number; // Optional since it's calculated from admins array
}

export interface CountriesResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: ApiCountry[];
}

export interface CountriesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: "name" | "createdAt";
  type?: "ascending" | "descending";
}

// Dashboard API types
export interface ActivityDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  eventType: string;
  message: string;
  createdAt: string;
}

export interface DashboardOverview {
  totalActiveUsers: number;
  globalRegions: number;
  totalCompanies: number;
  avgHealthScore: number;
  activityDistribution: ActivityDistribution[];
  recentActivity: RecentActivity[];
}

export type DashboardPeriod = "24h" | "7d" | "30d";

// Therapy sessions API types
export type TranscriptionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface TherapySessionAudio {
  name: string;
  extension: string;
  createdAt: string;
  url: string;
}

export interface TherapySession {
  id: string;
  psychologist: string;
  client: string;
  title: string;
  sessionDate: string;
  language: string;
  audio?: TherapySessionAudio;
  transcriptionStatus: TranscriptionStatus;
  transcriptionUpdatedAt?: string;
  summaryStatus: TranscriptionStatus;
  summaryUpdatedAt?: string;
  transcript?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TherapySessionsResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: TherapySession[];
}

export interface TherapySessionsQueryParams {
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
}

// Therapy patients API types
export type PatientScope = "all" | "direct" | "company";

export interface ApiPatient {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string[];
}

export interface PatientsResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: ApiPatient[];
}

export interface PatientsQueryParams {
  page?: number;
  limit?: number;
  scope?: PatientScope;
}
