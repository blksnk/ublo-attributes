import { Client, types } from "pg"

const DATABASE_URL = "postgres://postgres:postgres@127.0.0.1:5432/ublo-patrimoine-test"

types.setTypeParser(types.builtins.FLOAT4, parseFloat)
types.setTypeParser(types.builtins.FLOAT8, parseFloat)
types.setTypeParser(types.builtins.INT2, parseInt)
types.setTypeParser(types.builtins.INT4, parseInt)
types.setTypeParser(types.builtins.INT8, parseInt)
types.setTypeParser(types.builtins.NUMERIC, parseFloat)
types.setTypeParser(types.builtins.JSON, JSON.parse)

const instance = new Client(DATABASE_URL);
await instance.connect();


export default instance;