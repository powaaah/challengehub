export type AccountPrivacyPreferences = {
  rankingVisible: boolean;
  activityVisible: boolean;
  challengeMateDiscoverable: boolean;
};

export type AccountDataExport = {
  format: "challengehub-account-export-v1";
  exportedAt: string;
  account: { id: string; email: string; name: string; createdAt: string };
  privacy: AccountPrivacyPreferences;
  sessions: Array<{ id: string; expiresAt: string; createdAt: string }>;
  passwordResets: Array<{ id: string; expiresAt: string; createdAt: string; usedAt: string | null }>;
  createdChallenges: Array<Record<string, unknown>>;
  participations: Array<Record<string, unknown> & { checkIns: Array<Record<string, unknown>> }>;
  createdInvitations: Array<Record<string, unknown>>;
  acceptedInvitations: Array<Record<string, unknown>>;
  challengeMate: {
    profile: Record<string, unknown> | null;
    connections: Array<Record<string, unknown>>;
    blocks: Array<Record<string, unknown>>;
    submittedReports: Array<Record<string, unknown>>;
  };
  retention: {
    preferences: Array<Record<string, unknown>>;
    notifications: Array<Record<string, unknown>>;
  };
};

export interface AccountDataRepository {
  getPrivacyPreferences(userId: string, updatedAt: string): AccountPrivacyPreferences | null;
  updatePrivacyPreferences(input: AccountPrivacyPreferences & {
    userId: string;
    updatedAt: string;
  }): { status: "updated" | "not_found" };
  exportAccountData(userId: string, exportedAt: string): AccountDataExport | null;
  deleteAccountData(input: {
    userId: string;
    auditId: string;
    deletedAt: string;
  }): { status: "deleted" | "not_found" };
}
