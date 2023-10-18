import {
  AnyAttribute, AttributeCreate,
  AttributeType, AttributeTypes
} from "../../types/attributes";
import { AttributeMapping, uuid } from "../../types/database";
import { Sql } from "postgres";
import {
  insertOne,
  selectOne, updateOne
} from "./queries.utils";

export const insertAttributeMapping = async (sql: Sql, attributeMappingId: uuid, attributeType: AttributeType, attributeId: uuid) => {
  return await insertOne(sql, "attributes_map", attributeMappingId, {attributeType, attributeId})
}

export const retrieveAttributeMapping = async (sql: Sql, attributeMappingId: uuid) => {
  return await selectOne<AttributeMapping>(sql, "attributes_map", attributeMappingId);
}
// never allow updating a mapping's attribute_type without changing its attribute_id. May cause type mismatch
export const updateAttributeMapping = async (sql: Sql, attributeMappingId: uuid, attributeType: AttributeType, attributeId: uuid) => {
  return await updateOne(sql, "attributes_map", attributeMappingId, {attributeType, attributeId})
}

export const insertAttribute = async (sql: Sql, attributeId: uuid, attribute: AttributeCreate<AnyAttribute>) => {
  if (!attribute.type || !AttributeTypes.includes(attribute.type)) {
    console.error("Tried to create an attribute with unknown type: " + attribute.type ?? "none");
    return false;
  }
  const table = `attribute_${attribute.type}`;
  return await insertOne(sql, table, attributeId, attribute, ["type"]);
}

export const retrieveAttribute = async <TAttribute extends AnyAttribute>(sql: Sql, attributeMapping: AttributeMapping) => {
  return await selectOne<TAttribute>(sql, `attribute_${attributeMapping[0]}`, attributeMapping[1]);
}

export const updateAttribute = async <TAttribute extends AnyAttribute>(sql: Sql, attributeId: uuid, update: Partial<TAttribute>) => {
  if (!update.type || !AttributeTypes.includes(update.type)) {
    console.error("Tried to update an attribute with unknown type: " + update.type ?? "none");
    return false;
  }

  const table = `attribute_${update.type}`;
  return await insertOne(sql, table, attributeId, update, ["type"]);
}