export interface AdminRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  gender: "male" | "female";
  height: number;
  weight: number;
  password: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateAdminRegistrationForm = (
  userInfo: AdminRegistrationFormData
): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};

  // First name validation
  if (!userInfo.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  // Last name validation
  if (!userInfo.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  // Email validation
  if (!userInfo.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Username validation
  if (!userInfo.username.trim()) {
    errors.username = "Username is required";
  } else if (userInfo.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  // Password validation
  if (!userInfo.password) {
    errors.password = "Password is required";
  } else if (userInfo.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  // Confirm password validation
  if (!userInfo.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (userInfo.password !== userInfo.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Height validation
  if (userInfo.height < 100 || userInfo.height > 250) {
    errors.height = "Height must be between 100-250 cm";
  }

  // Weight validation
  if (userInfo.weight < 30 || userInfo.weight > 300) {
    errors.weight = "Weight must be between 30-300 kg";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};