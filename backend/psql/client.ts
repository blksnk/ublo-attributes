import { Sql } from "postgres";
import { AttributeMapping, UnitDatabaseMap, uuid } from "../types/database";
import { createInstance } from "./instance";
import {
  insertAttribute,
  insertAttributeMapping, retrieveAttribute, retrieveAttributeMapping
} from "./queries/attribute.queries";
import { createUuid } from "../utils";
import { AnyAttribute, AttributeCreate } from "../types/attributes";
import { DatabaseUnitCreate } from "../types/units";
import { insertUnit, retrieveUnit } from "./queries/unit.queries";
export class PsqlClient {
  sql: Sql;
  units: UnitDatabaseMap;

  constructor() {
    this.units = new Map();
    this.sql = createInstance()
  }

  async insertAttributeMapping(attributeMapping: AttributeMapping) {
    const attributeMappingId = createUuid();
    const inserted = await insertAttributeMapping(this.sql, attributeMappingId, attributeMapping[0], attributeMapping[1])
    if (!inserted) throw new Error("Failed to insert attribute mapping for attribute of type " + attributeMapping[0]);
    return attributeMappingId;
  }

  async insertAttribute<TAttribute extends AnyAttribute>(attribute: AttributeCreate<TAttribute>) {
    const attributeId = createUuid();
    const inserted = await insertAttribute(this.sql, attributeId, attribute)
    if (!inserted) throw new Error("Failed to insert attribute of type " + attribute.type)
    return attributeId;
  }

  async retrieveAttribute<TAttribute extends AnyAttribute>(attributeMapping: AttributeMapping) {
    return await retrieveAttribute<TAttribute>(this.sql, attributeMapping);
  }

  async retrieveAttributeMapping(attributeMappingId: uuid) {
    return await retrieveAttributeMapping(this.sql, attributeMappingId);
  }

  async insertUnit(unit: DatabaseUnitCreate) {
    const unitId = createUuid();
    const inserted = await insertUnit(this.sql, unitId, unit);
    if (!inserted) throw new Error("Failed to insert unit");
    return unitId;
  }

  async retrieveUnit (unitId: uuid) {
    return await retrieveUnit(this.sql, unitId);
  }
}