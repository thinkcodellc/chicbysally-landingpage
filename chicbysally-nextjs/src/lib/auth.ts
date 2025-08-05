import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Helper function to get the current session
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const session = await auth();
  return !!session;
}

// Helper function to protect routes
export async function protectRoute() {
  const session = await auth();
  if (!session) {
    redirect("/?error=unauthorized");
  }
  return session;
}

// Helper function to redirect authenticated users
export async function redirectIfAuthenticated(redirectPath: string = "/stylecard") {
  const session = await auth();
  if (session) {
    redirect(redirectPath);
  }
}
