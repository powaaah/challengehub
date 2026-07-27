"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateAccountName } from "@/lib/accounts";
import { updateProfileName } from "@/lib/profile-name";

export type ProfileFormState = {
  error: string;
  success: string;
};

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
