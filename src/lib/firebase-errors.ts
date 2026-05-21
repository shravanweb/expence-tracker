import { FirebaseError } from "firebase/app";

export function getFirebaseErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        return error.message || fallback;
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
