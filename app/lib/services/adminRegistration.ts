const API_BASE_URL =
  "https://elathiness-backend-app-company-idea-production.up.railway.app";

export interface AdminRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  gender: "male" | "female";
  height: number;
  weight: number;
  password: string;
}

// API function for admin signup (new users)
export const signupAdmin = async (
  inviteToken: string,
  userData: AdminRegistrationData,
) => {
  const response = await fetch(
    `${API_BASE_URL}/v1/auth/signup/admin?inviteToken=${inviteToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.errors || error.message || "Failed to complete admin registration",
    );
  }

  return response.json();
};

// API function for existing user admin role acceptance
export const acceptAdminInvite = async (
  inviteToken: string,
  adminType: string,
) => {
  let endpoint = "";

  switch (adminType) {
    case "company":
      endpoint = `/v1/admin/company/invite/accept?token=${inviteToken}`;
      break;
    case "country":
      endpoint = `/v1/admin/country/invite/accept?token=${inviteToken}`;
      break;
    case "region":
      endpoint = `/v1/admin/region/invite/accept?token=${inviteToken}`;
      break;
    case "psychologist":
      endpoint = `/v1/admin/psychologist/invite/accept?token=${inviteToken}`;
      break;
    case "doctor":
      endpoint = `/v1/admin/doctor/invite/accept?token=${inviteToken}`;
      break;
    default:
      throw new Error("Invalid admin type");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.errors || error.message || "Failed to accept admin invitation",
    );
  }

  return response.json();
};

// Unified API function that handles both new user registration and existing user acceptance
export const handleAdminInvitation = async (
  inviteToken: string,
  adminType: string,
  isExistingUser: boolean,
  userData?: AdminRegistrationData,
) => {
  if (isExistingUser) {
    return acceptAdminInvite(inviteToken, adminType);
  } else {
    if (!userData) {
      throw new Error("User data is required for new user registration");
    }
    return signupAdmin(inviteToken, userData);
  }
};
