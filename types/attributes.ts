import type { uuid } from "./database";

export const AttributeTypes = [
  "address",
  "label",
  "price",
] as const;

export type AttributeType = typeof AttributeTypes[number];

export interface AttributeBase<T extends AttributeType> {
  id: uuid;
  type: T;
}

export type Attribute<
  T extends AttributeType | string = AttributeType | string,
  TFields extends Record<string, unknown> = Record<string, unknown>
> = (TFields & AttributeBase<T>);

export type AddressAttribute = Attribute<"address", {
  id: string;
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

export type AnyAttribute = AddressAttribute | LabelAttribute | PriceAttribute;

export type AttributeCreate<TAttribute extends Attribute | AnyAttribute = AnyAttribute> = Omit<TAttribute, "id">;


