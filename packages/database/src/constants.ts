import { type SupabaseClient } from "@supabase/supabase-js";

export enum Role {
  MEMBER = "member",
  ADMIN = "admin",
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REVOKED = "revoked",
}

export enum ContactStage {
  POTENTIAL = "potential",
  ACTIVE = "active",
  PAST = "past",
  DEAD = "dead",
}

export enum RecurrenceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export enum Weekday {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

export { SupabaseClient };
