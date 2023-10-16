import {
  AddressAttribute,
  AnyAttribute,
  AttributeType,
  CommentAttribute,
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
  comment: AttributeMap<CommentAttribute>
}


export type AttributeMapping = [AttributeType, uuid]

export type AttributeMappingMap = Map<uuid, AttributeMapping>
