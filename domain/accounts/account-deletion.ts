export function confirmAccountDeletion(input: {
  userId: string;
  password: string;
  findAccount: (userId: string) => { id: string; passwordHash: string } | null;
  verifyPassword: (password: string, passwordHash: string) => boolean;
  deleteAccount: (userId: string) => { status: "deleted" | "not_found" };
}) {
  const account = input.findAccount(input.userId);
  if (!account) return { status: "not_found" as const };
  if (!input.verifyPassword(input.password, account.passwordHash)) {
    return { status: "invalid_password" as const };
  }
  return input.deleteAccount(input.userId);
}
