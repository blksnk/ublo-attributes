import express from "express";
import morgan from "morgan";
import {
  ATTRIBUTE_BASE_URL,
  attributeRouter
} from "./routers/attribute.router";
import { UNIT_BASE_URL, unitRouter } from "./routers/unit.router";

const PORT = 4004 as const;
const LOG_FORMAT = ":remote-addr - \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" \":user-agent\" :response-time ms" as const;

const app = express();

app.use(express.json());
app.use(morgan(LOG_FORMAT))

app.use(ATTRIBUTE_BASE_URL, attributeRouter);
app.use(UNIT_BASE_URL, unitRouter);


app.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
})