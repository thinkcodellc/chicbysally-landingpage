"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      let message = "";
      switch (error) {
        case "OAuthAccountNotLinked":
          message = "This email is already associated with another account. Please sign in with the provider you used originally.";
          break;
        case "OAuthCallback":
          message = "Authentication failed. Please try again.";
          break;
        case "OAuthSignin":
          message = "Sign in failed. Please try again.";
          break;
        case "unauthorized":
          message = "You must be logged in to access this page.";
          break;
        default:
          message = "An unexpected error occurred. Please try again.";
      }
      setErrorMessage(message);
    }
  }, [error]);

  if (!errorMessage) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center">
          <i className="fas fa-exclamation-circle mr-2"></i>
          <span className="font-medium">Authentication Error</span>
        </div>
        <p className="mt-1 text-sm">{errorMessage}</p>
        <button 
          onClick={() => setErrorMessage(null)}
          className="mt-2 text-red-500 hover:text-red-700 text-xs font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
