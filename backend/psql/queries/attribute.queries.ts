import {
  AnyAttribute, AttributeCreate,
  AttributeType, AttributeTypes
} from "../../types/attributes";
import { AttributeMapping, uuid } from "../../types/database";
import { Client } from "pg";
import {
  deleteOne,
  insertOne,
  selectOne, updateOne
} from "./queries.utils";

export const insertAttributeMapping = async (sql: Client, attributeMappingId: uuid, attributeType: AttributeType, attributeId: uuid) => {
  return await insertOne(sql, "attributes_map", attributeMappingId, {attributeType, attributeId})
}

export const retrieveAttributeMapping = async (sql: Client, attributeMappingId: uuid): Promise<AttributeMapping | null> => {
  const res = await selectOne<{attributeType: AttributeType, attributeId: uuid}>(sql, "attributes_map", attributeMappingId);
  return res ? [res.attributeType, res.attributeId] : null;

}
// never allow updating a mapping's attribute_type without changing its attribute_id. May cause type mismatch
export const updateAttributeMapping = async (sql: Client, attributeMappingId: uuid, attributeType: AttributeType, attributeId: uuid) => {
  return await updateOne(sql, "attributes_map", attributeMappingId, {attributeType, attributeId})
}

export const deleteAttributeMapping = async (sql: Client, attributeMappingId: uuid,) => {
  return await deleteOne(sql, "attributes_map", attributeMappingId)
}

export const insertAttribute = async (sql: Client, attributeId: uuid, attribute: AttributeCreate<AnyAttribute>) => {
  if (!attribute.type || !AttributeTypes.includes(attribute.type)) {
    throw new Error("Tried to create an attribute with unknown type: " + attribute.type ?? "none");
  }
  const table = `attribute_${attribute.type}`;
  return await insertOne(sql, table, attributeId, attribute, ["type"]);
}

export const retrieveAttribute = async <TAttribute extends AnyAttribute>(sql: Client, attributeMapping: AttributeMapping) => {
  return await selectOne<TAttribute>(sql, `attribute_${attributeMapping[0]}`, attributeMapping[1]);
}

export const updateAttribute = async <TAttribute extends AnyAttribute>(sql: Client, attributeId: uuid, update: Partial<TAttribute>) => {
  if (!update.type || !AttributeTypes.includes(update.type)) {
    throw new Error("Tried to update an attribute with unknown type: " + update.type ?? "none");
  }

  const table = `attribute_${update.type}`;
  return await insertOne(sql, table, attributeId, update, ["type"]);
}

export const deleteAttribute = async (sql: Client, attributeMapping: AttributeMapping) => {
  return await deleteOne(sql, `attribute_${attributeMapping[0]}`, attributeMapping[1])
}