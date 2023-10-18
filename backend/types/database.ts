import {
  AddressAttribute,
  AnyAttribute, AttributeCreate,
  AttributeType,
  CommentAttribute,
  LabelAttribute,
  PriceAttribute
} from "./attributes";
import { DatabaseUnit, Unit, UnitCreate, UnitCreateResponse } from "./units";

export type uuid = string;

export type UnitDatabaseMap = Map<uuid, DatabaseUnit>;

export type AttributeMap<TAttribute extends AnyAttribute = AnyAttribute> = Map<uuid, TAttribute>;

export type AttributeRepository = {
  address: AttributeMap<AddressAttribute>;
  label: AttributeMap<LabelAttribute>;
  price: AttributeMap<PriceAttribute>;
  comment: AttributeMap<CommentAttribute>
}


export type AttributeMapping = [AttributeType, uuid]

export type AttributeMappingMap = Map<uuid, AttributeMapping>

export interface DatabaseShared {
  storeAttribute: <TAttribute extends AnyAttribute>(attribute: AttributeCreate<TAttribute>) => Promise<TAttribute>;
  fetchAttribute: (attributeMappingId: uuid) => Promise<AnyAttribute | null>;
  storeUnit: (unit: UnitCreate) => Promise<UnitCreateResponse>;
  fetchUnit: (unitId: uuid) => Promise<Unit | null>;
  addAttributeToUnit: <TAttribute extends AnyAttribute>(unitId: uuid, createAttributeOrId: AttributeCreate<TAttribute> | uuid) => Promise<Unit | null>
}