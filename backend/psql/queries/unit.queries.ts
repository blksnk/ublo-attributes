import { DatabaseUnit, DatabaseUnitCreate } from "../../types/units";
import { Conditions, uuid } from "../../types/database";
import {
  deleteOne, findMany, findOne,
  insertOne,
  selectOne,
  updateOne
} from "./queries.utils";
import { Client } from "pg";

export const insertUnit = async (sql: Client, unitId: uuid, unit: DatabaseUnitCreate) => {
  return await insertOne(sql, "unit", unitId, unit)
}

export const retrieveUnit = async (sql: Client, unitId: uuid) => {
  return await selectOne<DatabaseUnit>(sql, "unit", unitId);
}

export const updateUnit = async (sql: Client, unitId: uuid, update: Partial<DatabaseUnit>) => {
  return await updateOne(sql, "unit", unitId, update);
}

export const deleteUnit = async (sql: Client, unitId: uuid) => {
  return await deleteOne(sql, "unit", unitId)
}
