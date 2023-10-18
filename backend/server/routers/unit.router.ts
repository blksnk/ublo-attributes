import express from "express";
import { uuid } from "../../types/database";
import { db } from "../../database/runtime.database";
import { badRequest, internalError } from "./router.utils";
import { isValidUnitCreate } from "../../validators/unit.validator";

export const UNIT_BASE_URL = '/unit' as const;

const router = express.Router()

router.get('/:id', async (req, res) => {
  const { id } = req.params as { id: uuid | null };
  if(!id) {
    return badRequest(res, "No unit id provided");
  }
  const unit = await db.fetchUnit(id);
  if (!unit) {
    return badRequest(res, "No unit with found");
  }
  return res.json(unit)
})

router.post('/', async (req, res) => {
  const { unit, complete } = req.body as { unit?: unknown, complete?: boolean };
  console.log(unit, req.body)
  if(!unit) {
    return badRequest(res, "No valid unit in request body")
  }
  if(!isValidUnitCreate(unit)) {
    return badRequest(res, "Malformed unit in request body");
  }
  try {
    const createdUnit = await db.storeUnit(unit);
    if (complete) {
      const fetchedUnit = await db.fetchUnit(createdUnit.id);
      return res.json(fetchedUnit)
    }
    return res.json(createdUnit)
  } catch(e: Error) {
    console.error(e);
    return internalError(res, e.message);
  }
})

export const unitRouter = router;
