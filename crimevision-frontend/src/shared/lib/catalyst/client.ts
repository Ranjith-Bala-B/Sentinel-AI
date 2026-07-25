/**
 * Thin wrapper around the Zoho Catalyst Web SDK.
 *
 * In a real deployment this initializes with:
 *   import catalyst from "zcatalyst-sdk-node" (server) or the
 *   Catalyst Web SDK `<script>` bootstrap (client), using the
 *   project id configured in catalyst.json / index.html.
 *
 * This wrapper isolates that dependency behind a small interface so
 * the rest of the app never touches the SDK directly - it can be
 * swapped for the real `window.catalyst` global once this project is
 * pushed with `catalyst deploy` and the SDK script is injected.
 */

export interface CatalystUser {
  userId: string;
  email: string;
  name: string;
  role: "investigator" | "analyst" | "supervisor" | "administrator";
}

declare global {
  interface Window {
    catalyst?: {
      auth: {
        signIn: (email: string, password: string) => Promise<CatalystUser>;
        signOut: () => Promise<void>;
        currentUser: () => Promise<CatalystUser | null>;
        sendPasswordResetEmail: (email: string) => Promise<void>;
      };
    };
  }
}

function sdkAvailable(): boolean {
  return typeof window !== "undefined" && !!window.catalyst;
}

/**
 * Falls back to a local mock when the Catalyst Web SDK script is not
 * present (e.g. local development without `catalyst serve`). This
 * keeps the app runnable standalone while staying a drop-in once the
 * SDK is wired up in index.html per Catalyst's client hosting setup.
 */
export const catalystAuth = {
  async signIn(email: string, password: string): Promise<CatalystUser> {
    if (sdkAvailable()) {
      return window.catalyst!.auth.signIn(email, password);
    }
    return mockSignIn(email, password);
  },
  async signOut(): Promise<void> {
    if (sdkAvailable()) return window.catalyst!.auth.signOut();
    localStorage.removeItem("cv_mock_session");
  },
  async currentUser(): Promise<CatalystUser | null> {
    if (sdkAvailable()) return window.catalyst!.auth.currentUser();
    const raw = localStorage.getItem("cv_mock_session");
    return raw ? (JSON.parse(raw) as CatalystUser) : null;
  },
  async sendPasswordResetEmail(email: string): Promise<void> {
    if (sdkAvailable()) return window.catalyst!.auth.sendPasswordResetEmail(email);
    await new Promise((r) => setTimeout(r, 500));
    console.info(`[mock] Password reset email queued for ${email}`);
  },
};

async function mockSignIn(email: string, password: string): Promise<CatalystUser> {
  await new Promise((r) => setTimeout(r, 600));
  if (!email || password.length < 4) {
    throw new Error("Invalid credentials");
  }
  const role = inferRoleFromEmail(email);
  const user: CatalystUser = {
    userId: "mock-" + btoa(email).slice(0, 8),
    email,
    name: email.split("@")[0].replace(/[._]/g, " "),
    role,
  };
  localStorage.setItem("cv_mock_session", JSON.stringify(user));
  return user;
}

function inferRoleFromEmail(email: string): CatalystUser["role"] {
  if (email.includes("admin")) return "administrator";
  if (email.includes("supervisor")) return "supervisor";
  if (email.includes("analyst")) return "analyst";
  return "investigator";
}
