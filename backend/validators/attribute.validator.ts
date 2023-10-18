import { AttributeCreate, AttributeTypes } from "../types/attributes";

export const isValidAttributeCreate = (a: AttributeCreate | Record<string, unknown> | undefined): a is AttributeCreate => {
  if (!a || typeof a !== "object") return false;
  return (!!a.type && typeof a.type === "string" && AttributeTypes.includes(a.type))
}