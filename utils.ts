import { v4 } from 'uuid';
import type { uuid } from "./types/database";
import { inspect } from "util";

export const createUuid = (): uuid => (v4() as uuid);

export const log = (o: Record<string, unknown>) => console.log(inspect(o, {showHidden: false, depth: null, colors: true}))
