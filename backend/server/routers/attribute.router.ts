import express from "express";
import { uuid } from "../../types/database";
import { db } from "../../database/runtime.database";
import { badRequest, internalError } from "./router.utils";
import { isValidAttributeCreate } from "../../validators/attribute.validator";

export const ATTRIBUTE_BASE_URL = '/attribute' as const;

const router = express.Router()

router.get('/:id', async (req, res) => {
  const { id } = req.params as { id: uuid | null };
  if(!id) {
    return badRequest(res, "No attribute id provided");
  }
  const attribute = await db.fetchAttribute(id);
  if (!attribute) {
    return badRequest(res, "No attribute with found");
  }
  return res.json(attribute)
})

router.post('/', async (req, res) => {
  const { attribute } = req.body as { unit: unknown | undefined };
  if(!attribute) {
    return badRequest(res, "No valid attribute in request body")
  }
  if (!isValidAttributeCreate(attribute)) {
    return badRequest(res, "Invalid attribute in request body")
  }

  try {
    const createdAttribute = await db.storeAttribute(attribute);
    return res.json(createdAttribute)
  } catch(e: Error) {
    console.error(e);
    return internalError(res, e.message);
  }
})

export const attributeRouter = router;
