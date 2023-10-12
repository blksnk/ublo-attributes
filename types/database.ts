import {
  AddressAttribute,
  AnyAttribute, Attribute, AttributeType,
  LabelAttribute,
  PriceAttribute
} from "./attributes";
import { DatabaseUnit } from "./units";

export type uuid = string;

export type UnitDatabaseMap = Map<uuid, DatabaseUnit>;

export type AttributeMap<TAttribute extends AnyAttribute = AnyAttribute> = Map<uuid, TAttribute>;

export type AttributeRepository = {
  address: AttributeMap<AddressAttribute>;
  label: AttributeMap<LabelAttribute>;
  price: AttributeMap<PriceAttribute>;
}

export type AttributeMapping = [AttributeType, uuid]

export type AttributeMappingMap = Map<uuid, AttributeMapping>

export type AttributeTypeMap<T extends AttributeType> =
  T extends "address" ? AddressAttribute :
    T extends "label"? LabelAttribute :
      T extends "price" ? PriceAttribute :
        Attribute;