"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, getCurrentUser } from "@/lib/auth";
import { deleteAccountWithPassword, updateAccountPrivacyPreferences } from "@/lib/account-data";
import { updateAccountName } from "@/lib/accounts";
import { updateProfileName } from "@/lib/profile-name";

export type ProfileFormState = {
  error: string;
  success: string;
};

export type PrivacyFormState = ProfileFormState;
export type DeleteAccountState = ProfileFormState;

export async function updateProfileAction(
  _state: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/profil");
  }

  const result = updateProfileName({
    userId: user.id,
    name: String(formData.get("name") ?? ""),
    updateName: updateAccountName
  });

  if (result.status === "invalid_name") {
    return { error: "Der Benutzername muss 2 bis 30 Zeichen lang sein und darf kein @ enthalten.", success: "" };
  }
  if (result.status === "account_conflict") {
    return { error: "Dieser Benutzername ist bereits vergeben.", success: "" };
  }
  if (result.status === "user_not_found") {
    redirect("/auth?next=/profil");
  }

  revalidatePath("/", "layout");
  return { error: "", success: "Benutzername gespeichert." };
}

export async function updatePrivacyAction(
  _state: PrivacyFormState,
  formData: FormData
): Promise<PrivacyFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/profil");

  const result = updateAccountPrivacyPreferences(user.id, {
    rankingVisible: formData.get("rankingVisible") === "on",
    activityVisible: formData.get("activityVisible") === "on",
    challengeMateDiscoverable: formData.get("challengeMateDiscoverable") === "on"
  });
  if (result.status === "not_found") redirect("/auth?next=/profil");

  revalidatePath("/", "layout");
  return { error: "", success: "Privatsphäre gespeichert." };
}

export async function deleteAccountAction(
  _state: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/profil");

  if (formData.get("confirmation") !== "on") {
    return { error: "Bitte bestätige zuerst, dass du die Folgen verstanden hast.", success: "" };
  }

  const password = String(formData.get("password") ?? "");
  const result = deleteAccountWithPassword(user.id, password);
  if (result.status === "invalid_password") {
    return { error: "Das Passwort ist nicht korrekt.", success: "" };
  }
  if (result.status === "not_found") redirect("/auth");

  await clearSession();
  redirect("/profil/geloescht");
}
