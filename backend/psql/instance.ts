import postgres, { Sql } from "postgres";

export const createInstance = (): Sql => {
  return postgres({
    host: "localhost",
    user: "postgres",
    port: 5432,
    database: "ublo-patrimoine-test",
  })
}