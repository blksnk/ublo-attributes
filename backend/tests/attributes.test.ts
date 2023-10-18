import { AnyAttribute, AttributeCreate } from "../types/attributes";
import { describe, expect, test } from "@jest/globals";
import { MockRepo, mockRepo } from "./database.mock";
import { DatabaseShared } from "../types/database";
import { log } from "../utils";

const testAttributeFields = <TAttribute extends AnyAttribute>(sent: AttributeCreate<TAttribute>, fetched: TAttribute) => {
  log({sent, fetched})
  Object.keys(sent).forEach((key) => {
    const k = key as keyof AttributeCreate<TAttribute>
    expect(sent[k]).toEqual((fetched as TAttribute)[k]);
  })
}

const testStoredAttribute = <TAttribute extends AnyAttribute>(sent: AttributeCreate<TAttribute>, stored: TAttribute) => {
  expect(stored.id).toBeDefined();
  testAttributeFields(sent, stored);
}

export const testFetchedAttribute = <TAttribute extends AnyAttribute>(sent: AttributeCreate<TAttribute>, fetched: TAttribute | null) => {
  expect(fetched).not.toBeNull()
  fetched = fetched as TAttribute;
  expect(fetched.id).toBeDefined()
  testAttributeFields(sent, fetched as TAttribute);
}

const runAttributeTests = (
  db: DatabaseShared,
  sentAttribute: AttributeCreate<AnyAttribute>,
  attributeName: string
) => {
  let storedAttribute: AnyAttribute;
  let fetchedAttribute: AnyAttribute | null;
  describe(`Attribute ${attributeName}`, () => {
    test("stored", async () => {
      storedAttribute = await db.storeAttribute(sentAttribute);
      testStoredAttribute(sentAttribute, storedAttribute);
    })
    test("fetched", async () => {
      fetchedAttribute = await db.fetchAttribute(storedAttribute.id)
      testFetchedAttribute(sentAttribute, fetchedAttribute)
    })
  })
}

export const runAllAttributeTests = (db: DatabaseShared) => {
  describe("All attributes", () => {
    const keys = Object.keys(mockRepo.attributes);
    keys.forEach((key) => {
      const attribute = mockRepo.attributes[key as keyof MockRepo["attributes"]] as AnyAttribute;
      runAttributeTests(db, attribute, key);
    })
  })
}