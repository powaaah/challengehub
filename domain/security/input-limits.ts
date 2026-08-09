export const INPUT_LIMITS = {
  passwordBytes: 128,
  emailBytes: 254,
  loginIdentifierBytes: 254,
  usernameRawBytes: 120,
  resetTokenRawBytes: 64,
  challengeTitleChars: 100,
  challengeTitleBytes: 400,
  challengeCategoryChars: 50,
  challengeCategoryBytes: 200,
  challengeGoalChars: 200,
  challengeGoalBytes: 800,
  challengeDescriptionChars: 2_000,
  challengeDescriptionBytes: 8_000,
  challengeListItems: 20,
  challengeListItemChars: 300,
  challengeListItemBytes: 1_200,
  challengeListRawBytes: 24_020
} as const;

type ChallengeInput = {
  title: string;
  category: string;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
};

type RawChallengeInput = Omit<ChallengeInput, "rules" | "tips"> & {
  rules: string;
  tips: string;
};

type ChallengeField = keyof ChallengeInput;

export function hasUtf8ByteLengthAtMost(value: string, maximum: number) {
  return Buffer.byteLength(value, "utf8") <= maximum;
}

export function isPasswordWithinLimits(password: string) {
  return password.length >= 8 && hasUtf8ByteLengthAtMost(password, INPUT_LIMITS.passwordBytes);
}

export function isEmailWithinLimits(email: string) {
  const normalized = email.trim().toLowerCase();
  return normalized.includes("@") && hasUtf8ByteLengthAtMost(normalized, INPUT_LIMITS.emailBytes);
}

export function isEmailRawWithinLimits(email: string) {
  return hasUtf8ByteLengthAtMost(email, INPUT_LIMITS.emailBytes);
}

export function isLoginIdentifierWithinLimits(identifier: string) {
  return identifier.length > 0 && hasUtf8ByteLengthAtMost(identifier, INPUT_LIMITS.loginIdentifierBytes);
}

export function isUsernameRawWithinLimits(username: string) {
  return hasUtf8ByteLengthAtMost(username, INPUT_LIMITS.usernameRawBytes);
}

export function isResetTokenRawWithinLimits(token: string) {
  return hasUtf8ByteLengthAtMost(token, INPUT_LIMITS.resetTokenRawBytes);
}

export function isRawChallengeInputWithinLimits(input: RawChallengeInput) {
  return hasUtf8ByteLengthAtMost(input.title, INPUT_LIMITS.challengeTitleBytes)
    && hasUtf8ByteLengthAtMost(input.category, INPUT_LIMITS.challengeCategoryBytes)
    && hasUtf8ByteLengthAtMost(input.goal, INPUT_LIMITS.challengeGoalBytes)
    && hasUtf8ByteLengthAtMost(input.description, INPUT_LIMITS.challengeDescriptionBytes)
    && hasUtf8ByteLengthAtMost(input.rules, INPUT_LIMITS.challengeListRawBytes)
    && hasUtf8ByteLengthAtMost(input.tips, INPUT_LIMITS.challengeListRawBytes);
}

export function validateChallengeInput(input: ChallengeInput):
  | { valid: true }
  | { valid: false; field: ChallengeField } {
  if (!isTextWithinLimits(input.title, INPUT_LIMITS.challengeTitleChars, INPUT_LIMITS.challengeTitleBytes)) {
    return { valid: false, field: "title" };
  }
  if (!isTextWithinLimits(input.category, INPUT_LIMITS.challengeCategoryChars, INPUT_LIMITS.challengeCategoryBytes)) {
    return { valid: false, field: "category" };
  }
  if (!isTextWithinLimits(input.goal, INPUT_LIMITS.challengeGoalChars, INPUT_LIMITS.challengeGoalBytes)) {
    return { valid: false, field: "goal" };
  }
  if (!isTextWithinLimits(
    input.description,
    INPUT_LIMITS.challengeDescriptionChars,
    INPUT_LIMITS.challengeDescriptionBytes
  )) {
    return { valid: false, field: "description" };
  }
  if (!isListWithinLimits(input.rules)) {
    return { valid: false, field: "rules" };
  }
  if (!isListWithinLimits(input.tips)) {
    return { valid: false, field: "tips" };
  }
  return { valid: true };
}

function isListWithinLimits(values: string[]) {
  return values.length <= INPUT_LIMITS.challengeListItems
    && values.every((value) => isTextWithinLimits(
      value,
      INPUT_LIMITS.challengeListItemChars,
      INPUT_LIMITS.challengeListItemBytes
    ));
}

function isTextWithinLimits(value: string, maximumCharacters: number, maximumBytes: number) {
  return value.length > 0
    && Array.from(value).length <= maximumCharacters
    && hasUtf8ByteLengthAtMost(value, maximumBytes);
}
