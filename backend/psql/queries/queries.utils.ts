import { snakeCase } from "lodash";
import { Sql } from "postgres";
import { uuid } from "../../types/database";

export const stringifyValue = (value: unknown | undefined | null): string => {
  const t = typeof value;
  if (value === null || t === "undefined" || t === "function" || t === "symbol") return "NULL";
  if ( t === "number" || t === "boolean" || t === "bigint") return String(value);
  if (t === "object") {
    if (Array.isArray(value) && value.length === 0) return "NULL";
    return JSON.stringify(value);
  }
  return value as string;
}

export const formatKeys = (obj: Record<string, unknown>, omit: string[] = [], prepend: string[] = []): string[] => {
  return [
    ...prepend,
    ...Object.keys(obj)
      .filter(key => !omit.includes(key))
      .map(key => snakeCase(key))
  ]
}

export const formatValues = (obj: Record<string, unknown>, omit: string[] = [], prepend: string[] = []): string[] => {
  return [
    ...prepend.map(v => stringifyValue(v)),
    ...Object.entries(obj)
      .filter(([key, _]) => !omit.includes(key))
      .map(([_, v]) => stringifyValue(v))
  ]
}

export const insertOne = async <TEntity extends Record<string, unknown>>(
  sql: Sql,
  table: string,
  entityId: uuid,
  entity: TEntity,
  omit: string[] = ["id"],
  idColumnName = "id"
): Promise<boolean> => {
  try {
    const o = omit.includes(idColumnName) ? omit : [...omit, idColumnName];
    const columns = formatKeys(entity, o,[idColumnName, "created_at"])
    const values = formatValues(entity, o, [entityId, sql`now()` as string])
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

export const selectOne = async <TEntity extends unknown>(sql: Sql, table: string, entityId: uuid, idColumnName = "id"): Promise<TEntity | null> => {
  try {
    const [ entity ] = sql<TEntity[]>`
      SELECT * from ${table}
      WHERE ${idColumnName} = ${entityId}
    `
    return entity ?? null;
  } catch(e) {
    console.error(e);
    return null;
  }
}

export const updateOne = async <TEntity extends Record<string, unknown>>(
  sql: Sql,
  table: string,
  entityId: uuid,
  update: Partial<TEntity>,
  idColumnName = "id",
  unsafe = false
) => {
  try {
    // remove id from update, add "updated_at"
    const omit = unsafe ? [] : ["id"];
    const columns = formatKeys(update, omit, ["updated_at"]);
    const values = formatValues(update, omit, [sql`now()` as string]);
    const payload = Object.fromEntries(columns.map((col, i) => [col, values[i]]))
    await sql`
      UPDATE ${table} SET ${
        sql(payload, ...columns)
      }
      WHERE ${idColumnName} = ${entityId};
    `
  }
  catch(e) {
    console.error(e)
    return false;
  }

}