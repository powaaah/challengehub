import { randomUUID } from "node:crypto";
import type { AccountPrivacyPreferences } from "../domain/accounts/account-data-repository";
import { confirmAccountDeletion } from "../domain/accounts/account-deletion";
import { SqliteAccountDataRepository } from "../infrastructure/sqlite/sqlite-account-data-repository";
import { findAccountById } from "./accounts";
import { verifyPassword } from "./auth";
import { getDb } from "./db";

function getAccountDataRepository() {
  return new SqliteAccountDataRepository(getDb());
}

export function getAccountPrivacyPreferences(userId: string) {
  return getAccountDataRepository().getPrivacyPreferences(userId, new Date().toISOString());
}

export function updateAccountPrivacyPreferences(
  userId: string,
  preferences: AccountPrivacyPreferences
) {
  return getAccountDataRepository().updatePrivacyPreferences({
    userId,
    ...preferences,
    updatedAt: new Date().toISOString()
  });
}

export function exportAccountData(userId: string) {
  const data = getAccountDataRepository().exportAccountData(userId, new Date().toISOString());
  if (!data) return data;
  const db=getDb();
  const journeys=db.prepare('SELECT b.participation_id,b.state_json,b.updated_at FROM body_transformation b JOIN participations p ON p.id=b.participation_id WHERE p.user_id=?').all(userId) as unknown as {participation_id:string;state_json:string;updated_at:string}[];
  const photos=db.prepare('SELECT b.participation_id,b.slot,b.image,b.updated_at FROM body_transformation_photos b JOIN participations p ON p.id=b.participation_id WHERE p.user_id=?').all(userId) as unknown as {participation_id:string;slot:string;image:Uint8Array;updated_at:string}[];
  return {...data,bodyTransformation:journeys.map(({state_json,...row})=>({...row,state:JSON.parse(state_json)})),bodyTransformationPhotos:photos.map(({image,...row})=>({...row,mimeType:'image/jpeg',base64:Buffer.from(image).toString('base64')}))};
}

export async function deleteAccountWithPassword(userId: string, password: string) {
  const repository = getAccountDataRepository();
  return confirmAccountDeletion({
    userId,
    password,
    findAccount: findAccountById,
    verifyPassword,
    deleteAccount: (accountId) => repository.deleteAccountData({
      userId: accountId,
      auditId: randomUUID(),
      deletedAt: new Date().toISOString()
    })
  });
}
