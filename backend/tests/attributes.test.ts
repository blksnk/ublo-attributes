import { AnyAttribute, AttributeCreate } from "../types/attributes";
import { describe, expect, test } from "@jest/globals";
import { MockRepo, mockRepo } from "./database.mock";
import { DatabaseShared } from "../types/database";

const testAttributeFields = <TAttribute extends AnyAttribute>(sent: AttributeCreate<TAttribute>, fetched: TAttribute) => {
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

const runAttributeTests = async (
  db: DatabaseShared,
  sentAttribute: AttributeCreate<AnyAttribute>,
  attributeName: string
) => {
  let storedAttribute: AnyAttribute;
  let fetchedAttribute: AnyAttribute | null;
  await describe(`Attribute ${attributeName}`, async () => {
    await test("stored", async () => {
      storedAttribute = await db.storeAttribute(sentAttribute);
      testStoredAttribute(sentAttribute, storedAttribute);
    })
    await test("fetched", async () => {
      fetchedAttribute = await db.fetchAttribute(storedAttribute.id)
      testFetchedAttribute(sentAttribute, fetchedAttribute)
    })
  })
}

export const runAllAttributeTests = (db: DatabaseShared) => {
  describe("All attributes", () => {
    const keys = Object.keys(mockRepo.attributes);
    keys.forEach(key => {
      const attribute = mockRepo.attributes[key as keyof MockRepo["attributes"]] as AnyAttribute;
      runAttributeTests(db, attribute, key);
    })
  })
}