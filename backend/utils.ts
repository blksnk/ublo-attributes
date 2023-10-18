import { v4 } from 'uuid';
import type { uuid } from "./types/database";
import { inspect } from "util";

export const createUuid = (): uuid => (v4() as uuid);

export const log = (o: Record<string, unknown>) => console.log(inspect(o, {showHidden: false, depth: null, colors: true}))

export const asyncSome = async <T extends unknown>(arr: T[], predicate: (e: T) => Promise<boolean>) => {
  for (let e of arr) {
    if (await predicate(e)) return true;
  }
  return false;
};

export const asyncEvery = async <T extends unknown>(arr: T[], predicate: (e: T) => Promise<boolean>) => {
  for (let e of arr) {
    if (!await predicate(e)) return false;
  }
  return true;
};