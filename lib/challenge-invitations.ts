import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { ChallengeInvitationRepository } from "../domain/invitations/challenge-invitation-repository.ts";
import { SqliteChallengeInvitationRepository } from "../infrastructure/sqlite/sqlite-challenge-invitation-repository.ts";
import { getDb } from "./db.ts";

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_TOKEN_ATTEMPTS = 3;

type InvitationDependencies = {
  repository: ChallengeInvitationRepository;
  createId: () => string;
  createToken: () => string;
};

export type CreateInvitationResult =
  | { status: "created"; token: string; expiresAt: string }
  | { status: "participation_not_available" | "token_generation_failed" };

export type InvitationPreview = {
  challengeSlug: string;
  inviterUserId: string;
  expiresAt: string;
};

export function createChallengeInvitation(
  input: {
    inviterParticipationId: string;
    inviterUserId: string;
    now?: Date;
  },
  dependencies: InvitationDependencies = getInvitationDependencies()
): CreateInvitationResult {
  const createdAt = (input.now ?? new Date()).toISOString();
  const expiresAt = new Date(Date.parse(createdAt) + INVITATION_LIFETIME_MS).toISOString();

  for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt += 1) {
    const token = dependencies.createToken();
    const result = dependencies.repository.create({
      id: dependencies.createId(),
      inviterParticipationId: input.inviterParticipationId,
      inviterUserId: input.inviterUserId,
      tokenHash: hashInvitationToken(token),
      createdAt,
      expiresAt
    });

    if (result.status === "created") {
      return { status: "created", token, expiresAt };
    }

    if (result.status === "participation_not_available") {
      return { status: "participation_not_available" };
    }
  }

  return { status: "token_generation_failed" };
}

export function hashInvitationToken(token: string) {
  return `sha256:${createHash("sha256").update(token, "utf8").digest("hex")}`;
}

export function getChallengeInvitationPreview(
  token: string,
  now = new Date(),
  repository: ChallengeInvitationRepository = getInvitationDependencies().repository
): InvitationPreview | null {
  if (!isInvitationToken(token)) return null;
  const invitation = repository.findActiveByTokenHash(hashInvitationToken(token), now.toISOString());
  if (!invitation) return null;

  return {
    challengeSlug: invitation.challengeSlug,
    inviterUserId: invitation.inviterUserId,
    expiresAt: invitation.expiresAt
  };
}

export function acceptChallengeInvitation(
  input: { token: string; inviteeUserId: string; now?: Date },
  dependencies: Pick<InvitationDependencies, "repository" | "createId"> = getInvitationDependencies()
) {
  if (!isInvitationToken(input.token)) {
    return { status: "invitation_not_available" } as const;
  }

  return dependencies.repository.accept({
    tokenHash: hashInvitationToken(input.token),
    inviteeUserId: input.inviteeUserId,
    participationId: dependencies.createId(),
    acceptedAt: (input.now ?? new Date()).toISOString()
  });
}

function isInvitationToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}

function getInvitationDependencies(): InvitationDependencies {
  return {
    repository: new SqliteChallengeInvitationRepository(getDb()),
    createId: randomUUID,
    createToken: () => randomBytes(32).toString("base64url")
  };
}
