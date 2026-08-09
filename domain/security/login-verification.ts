type VerifyLoginAttemptInput = {
  password: string;
  passwordHash: string | null;
  dummyPasswordHash: string;
  verifyPassword: (password: string, storedHash: string) => boolean;
};

export function verifyLoginAttempt(input: VerifyLoginAttemptInput) {
  const verified = input.verifyPassword(
    input.password,
    input.passwordHash ?? input.dummyPasswordHash
  );
  return input.passwordHash !== null && verified;
}
