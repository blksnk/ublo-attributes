import { Sql } from "postgres";
import { AttributeMapping, uuid } from "../types/database";
import { createInstance } from "./instance";
import {
  insertAttribute,
  insertAttributeMapping,
  retrieveAttribute,
  retrieveAttributeMapping, updateAttribute,
  updateAttributeMapping
} from "./queries/attribute.queries";
import { createUuid } from "../utils";
import { AnyAttribute, AttributeCreate } from "../types/attributes";
import { DatabaseUnit, DatabaseUnitCreate } from "../types/units";
import { insertUnit, retrieveUnit, updateUnit } from "./queries/unit.queries";
export class PsqlClient {
  sql: Sql;

  constructor() {
    this.sql = createInstance()
  }

  public async insertAttributeMapping(attributeMapping: AttributeMapping) {
    const attributeMappingId = createUuid();
    const inserted = await insertAttributeMapping(this.sql, attributeMappingId, attributeMapping[0], attributeMapping[1])
    if (!inserted) throw new Error("Failed to insert attribute mapping for attribute of type " + attributeMapping[0]);
    return attributeMappingId;
  }

  public async retrieveAttributeMapping(attributeMappingId: uuid) {
    return await retrieveAttributeMapping(this.sql, attributeMappingId);
  }

  public async updateAttributeMapping(attributeMappingId: uuid, update: AttributeMapping) {
    const updated = await updateAttributeMapping(this.sql, attributeMappingId, update[0], update[1]);
    if (!updated) throw new Error("Failed to update attribute mapping with id " + attributeMappingId);
    return attributeMappingId;
  }

  public async insertAttribute<TAttribute extends AnyAttribute>(attribute: AttributeCreate<TAttribute>) {
    const attributeId = createUuid();
    const inserted = await insertAttribute(this.sql, attributeId, attribute)
    if (!inserted) throw new Error("Failed to insert attribute of type " + attribute.type)
    return attributeId;
  }

  public async retrieveAttribute<TAttribute extends AnyAttribute>(attributeMapping: AttributeMapping) {
    return await retrieveAttribute<TAttribute>(this.sql, attributeMapping);
  }

  public async updateAttribute <TAttribute extends AnyAttribute>(attributeId: uuid, update: Partial<TAttribute>) {
    const updated = await updateAttribute(this.sql, attributeId, update);
    if (!updated) throw new Error("Failed to update attribute with id " + attributeId);
    return attributeId;
  }

  public async insertUnit(unit: DatabaseUnitCreate) {
    const unitId = createUuid();
    const inserted = await insertUnit(this.sql, unitId, unit);
    if (!inserted) throw new Error("Failed to insert unit");
    return unitId;
  }

  public async retrieveUnit (unitId: uuid) {
    return await retrieveUnit(this.sql, unitId);
  }

  public async updateUnit(unitId: uuid, update: Partial<DatabaseUnit>) {
    const updated = await updateUnit(this.sql, unitId, update);
    if (!updated) throw new Error("Failed to update unit with id " + unitId);
    return unitId;
  }

  // TODO: implement deletion
}