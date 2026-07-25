import { catalystAuth, type CatalystUser } from "@/shared/lib/catalyst/client";

export const authApi = {
  login: (email: string, password: string): Promise<CatalystUser> =>
    catalystAuth.signIn(email, password),
  logout: (): Promise<void> => catalystAuth.signOut(),
  me: (): Promise<CatalystUser | null> => catalystAuth.currentUser(),
  requestPasswordReset: (email: string): Promise<void> =>
    catalystAuth.sendPasswordResetEmail(email),
};
