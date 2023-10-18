import { DatabaseUnit, DatabaseUnitCreate } from "../../types/units";
import { Sql } from "postgres";
import { uuid } from "../../types/database";
import {
  insertOne,
  selectOne,
  updateOne
} from "./queries.utils";

export const insertUnit = async (sql: Sql, unitId: uuid, unit: DatabaseUnitCreate) => {
  return await insertOne(sql, "unit", unitId, unit)
}

export const retrieveUnit = async (sql: Sql, unitId: uuid) => {
  return await selectOne<DatabaseUnit>(sql, "unit", unitId);
}

export const updateUnit = async (sql: Sql, unitId: uuid, update: Partial<DatabaseUnit>) => {
  return await updateOne(sql, "unit", unitId, update);
}