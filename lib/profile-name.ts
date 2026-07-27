import { normalizeUsername } from "../domain/accounts/username.ts";

type UpdateNameResult = {
  status: "updated" | "account_conflict" | "user_not_found";
};

type UpdateProfileNameInput = {
  userId: string;
  name: string;
  updateName: (userId: string, name: string) => UpdateNameResult;
};

export type UpdateProfileNameResult =
  | { status: "updated"; name: string }
  | { status: "invalid_name" | "account_conflict" | "user_not_found" };

export function updateProfileName(input: UpdateProfileNameInput): UpdateProfileNameResult {
  const name = normalizeUsername(input.name);
  if (!isValidUsername(name)) {
    return { status: "invalid_name" };
  }
  const result = input.updateName(input.userId, name);
  return result.status === "updated" ? { status: "updated", name } : { status: result.status };
}

export function isValidUsername(name: string) {
  return name.length >= 2
    && name.length <= 30
    && !name.includes("@")
    && !/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Zl}\p{Zp}]/u.test(name)
    && /[\p{L}\p{N}]/u.test(name);
}
