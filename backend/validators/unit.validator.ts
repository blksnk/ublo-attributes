import { UnitCreate } from "../types/units";
import { isValidAttributeCreate } from "./attribute.validator";
import { isValidUUid } from "./validator.utils";

export const isValidUnitCreate = (u: unknown | undefined | UnitCreate): u is UnitCreate => {
  if (!u) return false;
  if (typeof u !== "object") return false;
  if(u.attributes) {
    if (!Array.isArray(u.attributes)) return false;
    return u.attributes.every(a => {
      return isValidUUid(a) || isValidAttributeCreate(a)
    })
  }
  if(u.children) {
    if (!Array.isArray(u.children)) return false;
    return u.children.every(c => isValidUnitCreate(c));
  }
  return true;
}