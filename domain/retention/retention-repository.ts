import type { RetentionNotificationType } from "./retention-notification.ts";

export type RetentionPreferences = {
  inAppEnabled: boolean;
  emailReminderEnabled: boolean;
  weeklyRecapEnabled: boolean;
};

export type RetentionNotification = {
  id: string;
  type: RetentionNotificationType;
  title: string;
  body: string;
  href: string;
  occurredAt: string;
  readAt: string | null;
};

export type RetentionDashboard = {
  preferences: RetentionPreferences;
  notifications: RetentionNotification[];
};

export type RetentionEmailJob = RetentionNotification & {
  userId: string;
  email: string;
  participationId: string;
};

export interface RetentionRepository {
  getDashboard(input: {
    userId: string;
    participationId: string;
    today: string;
    now: string;
  }): RetentionDashboard | null;
  updatePreferences(input: RetentionPreferences & {
    userId: string;
    participationId: string;
    updatedAt: string;
  }): { status: "updated" | "not_found" };
  markRead(input: {
    notificationId: string;
    userId: string;
    readAt: string;
  }): { status: "updated" | "not_found" };
  disableEmail(input: {
    userId: string;
    participationId: string;
    updatedAt: string;
  }): { status: "updated" | "not_found" };
  listDueEmailJobs(input: { today: string; now: string; limit: number }): RetentionEmailJob[];
  markEmailDelivered(input: { notificationId: string; deliveredAt: string }): void;
}
