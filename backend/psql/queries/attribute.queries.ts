import {
  AnyAttribute, AttributeCreate,
  AttributeType
} from "../../types/attributes";
import { AttributeMapping, uuid } from "../../types/database";
import { Sql } from "postgres";
import { formatKeys, formatValues, selectOne } from "./queries.utils";

export const insertAttributeMapping = async (sql: Sql, attributeMappingId: uuid, attributeType: AttributeType, attributeId: uuid) => {
  try {
    const columns = ["id", "attribute_type", "attribute_id"]
    const values = [attributeMappingId, attributeType, attributeId]
    await sql`
    INSERT INTO attributes_map ${sql(columns)}
    values ${sql(values)}
  `;
    return true;
  } catch(e) {
    console.error(e);
    return false;
  }
}

export const insertAttribute = async (sql: Sql, attributeId: uuid, attribute: AttributeCreate<AnyAttribute>) => {
  try {
  const table = `attribute_${attribute.type}`;
  const columns = formatKeys(attribute, ['type'], ['id'])
  const values = formatValues(attribute, ["type"], [attributeId])
  await sql`
    INSERT INTO ${table} ${sql(columns)}
    values ${sql(values)}
  `;
  return true;
  } catch(e) {
    console.error(e);
    return false;
  }
}

export const retrieveAttribute = async <TAttribute extends AnyAttribute>(sql: Sql, attributeMapping: AttributeMapping) => {
  try {
    return await selectOne<TAttribute>(sql, `attribute_${attributeMapping[0]}`, attributeMapping[1]);
  } catch(e) {
    console.error(e)
    return null;
  }
}

export const retrieveAttributeMapping = async (sql: Sql, attributeMappingId: uuid) => {
  try {
    return await selectOne<AttributeMapping>(sql, "attributes_map", attributeMappingId);
  }
  catch(e) {
    console.error(e)
    return null;
  }
}