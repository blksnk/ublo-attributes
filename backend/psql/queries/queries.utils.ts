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

export const selectOne = async <TEntity extends unknown>(sql: Sql, table: string, entityId: uuid, idColumnName = "id"): Promise<TEntity | null> => {
  const [ entity ] = sql<TEntity[]>`
    SELECT * from ${table}
    WHERE ${idColumnName} = ${entityId}
  `
  return entity ?? null;
}