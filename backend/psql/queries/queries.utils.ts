import { snakeCase, camelCase } from "lodash";
import { Client } from "pg";
import { uuid } from "../../types/database";

export const stringifyValue = (value: unknown | undefined | null): string => {
  const t = typeof value;
  if ( t === "number" || t === "boolean" || t === "bigint") return String(value);
  const s = (() => {
  if (value === null || t === "undefined" || t === "function" || t === "symbol") return "NULL";
  if (t === "object") {
    if (Array.isArray(value) && value.length === 0) return "NULL";
    return JSON.stringify(value);
  }
  return value as string;
  })()
  return s === "NULL" ? s : `'${s}'`
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

export const formatColumnPayload = (columns: string[]) => {
  return `(${columns.join(', ')})`
}

export const formatValuePayload = (values: string[]) => {
  return `VALUES(${values.join(', ')})`
}

export const formatUpdatePayload = (columns: string[], values: string[]) => {
  return columns.map((col, i) => `${col} = ${values[i]}`).join(', ')
}

export const formatRawResponse = <TEntity extends Record<string, unknown>>(raw: Record<string, unknown>) => {
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [camelCase(key), value])) as TEntity;
}

export const insertOne = async <TEntity extends Record<string, unknown>>(
  sql: Client,
  table: string,
  entityId: uuid,
  entity: TEntity,
  omit: string[] = ["id"],
  idColumnName = "id"
): Promise<boolean> => {
  try {
    const o = omit.includes(idColumnName) ? omit : [...omit, idColumnName];
    const columns = formatColumnPayload(formatKeys(entity, o,[idColumnName, "created_at"]))
    const values = formatValuePayload(formatValues(entity, o, [entityId, "now()"]))
    await sql.query(`INSERT INTO ${table} ${columns} ${values}`)
    return true;
  } catch(e) {
    console.error(e);
    return false;
  }
}

export const selectOne = async <TEntity extends object>(sql: Client, table: string, entityId: uuid, idColumnName = "id"): Promise<TEntity | null> => {
  try {
    const res = await sql.query(`SELECT * from ${table} WHERE ${idColumnName} = '${entityId}'`)
    return res.rows ? formatRawResponse<TEntity>(res.rows[0]) : null;
  } catch(e) {
    console.error(e);
    return null;
  }
}

export const updateOne = async <TEntity extends Record<string, unknown>>(
  sql: Client,
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
    const values = formatValues(update, omit, ["now()"]);
    await sql.query(`UPDATE ${table} SET ${formatUpdatePayload(columns, values)} WHERE ${idColumnName} = '${entityId}'`)
    return true;
  }
  catch(e) {
    console.error(e)
    return false;
  }

}