import type { Route } from "./+types/login";
import { redirect } from "react-router";
import LoginContainer from "../../src/components/login/LoginContainer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Secure login to the Ealthiness admin platform",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Check if user is already logged in
  const url = new URL(request.url);
  const isAuthenticated = false; // This would check session/token in real app

  if (isAuthenticated) {
    return redirect("/");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");

  // Basic validation
  if (!email || !password || !role) {
    return {
      error: "All fields are required",
      success: false,
    };
  }

  // In a real app, this would validate credentials against a database
  // For demo purposes, accept any credentials
  if (email && password) {
    // Set session/cookie here in real app
    return redirect(`/?role=${role}`);
  }

  return {
    error: "Invalid credentials",
    success: false,
  };
}

export default function Login() {
  return <LoginContainer />;
}
