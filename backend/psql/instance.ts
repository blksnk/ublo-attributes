import postgres from "postgres";

const DATABASE_URL = "postgres://postgres:postgres@127.0.0.1:5432/ublo-patrimoine-test"

const instance = postgres(DATABASE_URL);

export default instance;