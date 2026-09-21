"use client";

/**
 * Local-timezone date helpers for the reception desk.
 *
 * The previous implementation used `new Date().toISOString().split("T")[0]`, which is UTC:
 * for a hospital in IST (UTC+5:30) every "today" before 05:30 AM local resolved to *yesterday*,
 * so default appointment dates, KPI buckets and visit dates were wrong every night shift.
 */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** `YYYY-MM-DD` for a Date in the browser's local timezone. */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today as `YYYY-MM-DD` in local time. */
export function todayLocalDate(): string {
  return toLocalDateString(new Date());
}

/** Tomorrow as `YYYY-MM-DD` in local time. */
export function tomorrowLocalDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateString(tomorrow);
}

export function isValidDateString(dateStr?: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return !isNaN(new Date(`${dateStr}T00:00:00`).getTime());
}

/** True when the date is strictly before today (local). */
export function isPastDate(dateStr: string): boolean {
  if (!isValidDateString(dateStr)) return false;
  return dateStr < todayLocalDate();
}

/** Weekday name ("Monday") for a `YYYY-MM-DD` string, parsed in local time. */
export function dayNameOf(dateStr: string): string {
  if (!isValidDateString(dateStr)) return "";
  return DAY_NAMES[new Date(`${dateStr}T00:00:00`).getDay()] || "";
}

/** Converts "02:30 PM" into minutes since midnight; returns null when unparsable. */
export function slotToMinutes(slot: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((slot || "").trim());
  if (!match) return null;

  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + parseInt(match[2], 10);
}

/** True when the slot is already in the past for today's date. */
export function isPastSlot(dateStr: string, slot: string): boolean {
  if (!isValidDateString(dateStr)) return false;
  const today = todayLocalDate();
  if (dateStr > today) return false;
  if (dateStr < today) return true;

  const slotMinutes = slotToMinutes(slot);
  if (slotMinutes === null) return false;

  const now = new Date();
  return slotMinutes <= now.getHours() * 60 + now.getMinutes();
}

/** Human readable "21 Sep 2026" for slips and tables. */
export function formatDisplayDate(dateStr: string): string {
  if (!isValidDateString(dateStr)) return dateStr;
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
