import type { AnyAttribute, AttributeCreate } from "./attributes";
import type { uuid } from "./database";

export interface DatabaseUnit {
  id: uuid;
  attributesIds?: uuid[];
  childrenIds?: uuid[]
}

export interface UnitCreateResponse {
  id: uuid;
  attributesIds?: uuid[];
  children?: UnitCreateResponse[]
}

export interface Unit {
  id: uuid;
  attributes?: AnyAttribute[]
  children?: Unit[];
}

export type UnitCreate = {
  attributes?: (AttributeCreate | uuid)[]; // can be initialized with new attributes or existing attribute ids
  children?: (UnitCreate | uuid)[]; // can be initialized with new units or existing unit ids
}