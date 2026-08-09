import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileApp } from "@/components/profile-app";
import { getCurrentUser } from "@/lib/auth";
import { getAccountPrivacyPreferences } from "@/lib/account-data";
import { deleteAccountAction, updatePrivacyAction, updateProfileAction } from "./actions";

export const metadata: Metadata = {
  title: "Dein Profil | ChallengeHub",
  description: "Verwalte deinen ChallengeHub-Benutzernamen und deine Kontodaten.",
  robots: { index: false, follow: true }
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/profil");
  }

  const privacy = getAccountPrivacyPreferences(user.id);
  if (!privacy) redirect("/auth?next=/profil");

  return (
    <ProfileApp
      user={user}
      privacy={privacy}
      updateProfile={updateProfileAction}
      updatePrivacy={updatePrivacyAction}
      deleteAccount={deleteAccountAction}
    />
  );
}
