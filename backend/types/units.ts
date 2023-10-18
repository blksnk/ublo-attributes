import type { AnyAttribute, AttributeCreate } from "./attributes";
import type { uuid } from "./database";

export interface DatabaseUnit {
  id: uuid;
  attributeIds?: uuid[];
  childrenIds?: uuid[]
}

export type DatabaseUnitCreate = Omit<DatabaseUnit, "id">;

export interface UnitCreateResponse {
  id: uuid;
  attributeIds?: uuid[];
  children?: UnitCreateResponse[]
}

export interface Unit {
  id: uuid;
  attributes: AnyAttribute[]
  children: Unit[];
}

export type UnitCreate = {
  attributes?: (AttributeCreate | uuid)[]; // can be initialized with new attributes or existing attribute ids
  children?: (UnitCreate | uuid)[]; // can be initialized with new units or existing unit ids
}