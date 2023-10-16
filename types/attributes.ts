import type { uuid } from "./database";

export const AttributeTypes = [
  "address",
  "label",
  "price",
  "comment",
] as const;

export type AttributeType = typeof AttributeTypes[number];

export interface AttributeBase<T extends AttributeType> {
  id: uuid;
  type: T;
}

export type Attribute<
  T extends AttributeType = AttributeType,
  TFields extends Record<string, unknown> = Record<string, unknown>
> = (TFields & AttributeBase<T>);

export type AddressAttribute = Attribute<"address", {
  number?: string;
  street: string;
  street2?: string;
  city: string;
  zip: string;
  state?: string;
  country: string;
  entrance?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  }
}>

export type LabelAttribute = Attribute<"label", {
  label: string;
}>

export type PriceAttribute = Attribute<"price", {
  price: number;
}>

export type CommentAttribute = Attribute<"comment", {
  comment: string;
}>

export type AnyAttribute = AddressAttribute | LabelAttribute | PriceAttribute | CommentAttribute;

export type AttributeCreate<TAttribute extends Attribute | AnyAttribute = AnyAttribute> = Omit<TAttribute, "id">;


