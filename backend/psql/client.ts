import { AttributeMapping, Conditions, uuid } from "../types/database";
import instance from "./instance";
import {
  deleteAttribute,
  deleteAttributeMapping,
  insertAttribute,
  insertAttributeMapping,
  retrieveAttribute,
  retrieveAttributeMapping, updateAttribute,
  updateAttributeMapping
} from "./queries/attribute.queries";
import { createUuid } from "../utils";
import { AnyAttribute, AttributeCreate } from "../types/attributes";
import { DatabaseUnit, DatabaseUnitCreate } from "../types/units";
import {
  deleteUnit,
  insertUnit,
  retrieveUnit,
  updateUnit
} from "./queries/unit.queries";
import { Client } from "pg";
import { findOneOrMany } from "./queries/queries.utils";
export class PsqlClient {
  sql: Client;

  constructor() {
    this.sql = instance;
  }

  public async insertAttributeMapping(attributeMapping: AttributeMapping) {
    console.debug('Attempting to insert attribute mapping')
    const attributeMappingId = createUuid();
    const inserted = await insertAttributeMapping(this.sql, attributeMappingId, attributeMapping[0], attributeMapping[1])
    if (!inserted) throw new Error("Failed to insert attribute mapping for attribute of type " + attributeMapping[0]);
    return attributeMappingId;
  }

  public async retrieveAttributeMapping(attributeMappingId: uuid) {
    console.debug('Attempting to retrieve attribute mapping ' + attributeMappingId)
    return await retrieveAttributeMapping(this.sql, attributeMappingId);
  }

  public async updateAttributeMapping(attributeMappingId: uuid, update: AttributeMapping) {
    console.debug('Attempting to update attribute mapping ' + attributeMappingId)
    const updated = await updateAttributeMapping(this.sql, attributeMappingId, update[0], update[1]);
    if (!updated) throw new Error("Failed to update attribute mapping with id " + attributeMappingId);
    return attributeMappingId;
  }

  public async deleteAttributeMapping(attributeMappingId: uuid) {
    console.debug('Attempting to delete attribute mapping ' + attributeMappingId)
    const deleted = await deleteAttributeMapping(this.sql, attributeMappingId);
    if (!deleted) throw new Error("Failed to delete attribute mapping with id " + attributeMappingId);
    return true;
  }

  public async insertAttribute<TAttribute extends AnyAttribute>(attribute: AttributeCreate<TAttribute>) {
    console.debug('Attempting to insert attribute of type ' + attribute.type)
    const attributeId = createUuid();
    const inserted = await insertAttribute(this.sql, attributeId, attribute)
    if (!inserted) throw new Error("Failed to insert attribute of type " + attribute.type)
    return attributeId;
  }

  public async retrieveAttribute<TAttribute extends AnyAttribute>(attributeMapping: AttributeMapping) {
    console.debug('Attempting to retrieve attribute ' + attributeMapping[1])
    return await retrieveAttribute<TAttribute>(this.sql, attributeMapping);
  }

  public async updateAttribute <TAttribute extends AnyAttribute>(attributeId: uuid, update: Partial<TAttribute>) {
    console.debug('Attempting to update attribute ' + attributeId)
    const updated = await updateAttribute(this.sql, attributeId, update);
    if (!updated) throw new Error("Failed to update attribute with id " + attributeId);
    return attributeId;
  }

  public async deleteAttribute<TAttribute extends AnyAttribute>(attributeMapping: AttributeMapping) {
    console.debug('Attempting to delete attribute ' + attributeMapping[1])
    const deleted = await deleteAttribute(this.sql, attributeMapping);
    if (!deleted) throw new Error("Failed to delete attribute with id " + attributeMapping[1]);
    return true;
  }

  public async insertUnit(unit: DatabaseUnitCreate) {
    console.debug('Attempting to insert unit')
    const unitId = createUuid();
    const inserted = await insertUnit(this.sql, unitId, unit);
    if (!inserted) throw new Error("Failed to insert unit");
    return unitId;
  }

  public async retrieveUnit (unitId: uuid) {
    console.debug('Attempting to retrieve unit ' + unitId)
    return await retrieveUnit(this.sql, unitId);
  }

  public async updateUnit(unitId: uuid, update: Partial<DatabaseUnit>) {
    console.debug('Attempting to update unit ' + unitId)
    const updated = await updateUnit(this.sql, unitId, update);
    if (!updated) throw new Error("Failed to update unit with id " + unitId);
    return unitId;
  }

  public async deleteUnit(unitId: uuid) {
    console.debug('Attempting to delete unit ' + unitId)
    const deleted = await deleteUnit(this.sql, unitId);
    if (!deleted) throw new Error("Failed to delete unit " + unitId);
    return true;
  }

  public async findUnits(conditions: Conditions<DatabaseUnit>, onlyOne = false) {
    console.debug("Attempting to find unit fulfilling conditions " + JSON.stringify(conditions))
    return await findOneOrMany<DatabaseUnit>(this.sql, "unit", conditions, onlyOne);
  }
}