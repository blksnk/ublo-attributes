import { DatabaseUnit, DatabaseUnitCreate } from "../../types/units";
import { Sql } from "postgres";
import { uuid } from "../../types/database";
import { formatKeys, formatValues, selectOne } from "./queries.utils";

export const insertUnit = async (sql: Sql, unitId: uuid, unit: DatabaseUnitCreate) => {
  try {
    const columns = formatKeys(unit, [], ["id"]);
    const values = formatValues(unit, [], [unitId])
    await sql`
      INSERT INTO unit ${sql(columns)}
      values ${sql(values)}
    `
  }
  catch (e) {
    console.error(e);
    return false;
  }
}

export const retrieveUnit = async (sql: Sql, unitId: uuid) => {
  try {
    return await selectOne<DatabaseUnit>(sql, "unit", unitId);
  } catch(e) {
    console.error(e);
    return null;
  }
}