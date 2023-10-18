import { uuid } from "../types/database";

export const isValidUUid = (id: unknown | uuid | string | undefined | null): id is uuid => {
  if (!id) return false;
  return typeof id === "string" && id.length === 36;
}