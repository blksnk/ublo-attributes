import { PsqlDatabase } from "./psql.database";
import { RuntimeDatabase } from "./runtime.database";
import { DatabaseShared } from "../types/database";

export const createDatabase = (type: "runtime" | "psql"): DatabaseShared => {
  return type === "psql" ? new PsqlDatabase() : new RuntimeDatabase();
}