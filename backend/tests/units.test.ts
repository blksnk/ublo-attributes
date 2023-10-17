import { Unit, UnitCreate, UnitCreateResponse } from "../../types/units";
import { describe, expect, test } from "@jest/globals";
import { MockRepo, mockRepo } from "./database.mock";
import { log } from "../../utils";
import { Database } from "../database";
import { testFetchedAttribute } from "./attributes.test";
import {
  AnyAttribute,
  AttributeCreate,
  CommentAttribute,
  LabelAttribute
} from "../../types/attributes";

const testStoredUnit = (sent: UnitCreate, stored: UnitCreateResponse) => {
  expect(stored.id).toBeDefined()
  if (sent.attributes && sent.attributes.length > 0) {
    expect(stored.attributesIds).toBeDefined()
    expect(stored.attributesIds?.length).toEqual(sent.attributes.length)
  }
  if (sent.children && sent.children.length > 0) {
    expect(stored.children).toBeDefined()
    expect(stored.children?.length).toEqual(sent.children.length);
    sent.children.forEach((sentChild, index ) => {
      const storedChild = (stored.children ?? [])[index]
      expect(storedChild).toBeDefined()
      expect(storedChild?.id).toBeDefined()
      if(typeof sentChild === "string") {
        expect(sentChild).toEqual(storedChild.id)
      } else {
        testStoredUnit(sentChild, storedChild as UnitCreateResponse)
      }
    })
  }
}

const testFetchedUnit = (sent: UnitCreate, stored: UnitCreateResponse, fetched: Unit | null, testName?: string) => {
  expect(fetched).not.toBeNull()
  fetched = fetched as Unit;
  expect(fetched.id).toBeDefined()
  console.log(testName ? `\n\n${testName} ${stored.id}\n` :  "\n\n")
  log({ sent, stored, fetched})

  if(sent.attributes && (sent.attributes?.length > 0 || (fetched.attributes?.length ?? 0) < 0)) {
    expect(fetched.attributes?.length).toEqual(sent.attributes?.length);
    sent.attributes?.forEach(sentAttribute => {
      const fetchedAttribute = (fetched as Unit).attributes?.find(({id, type}) => (
        typeof sentAttribute === "string" ? id === sentAttribute : type === sentAttribute.type
      ))
      expect(fetchedAttribute).toBeDefined()
      if(typeof sentAttribute !== "string" && !!fetchedAttribute) {
        testFetchedAttribute(sentAttribute, fetchedAttribute);
      }
    })
  }
  if(!sent.children) return;

  const sentChildrenLength = sent.children.length ?? 0;
  const fetchedChildrenLength = fetched.children?.length ?? 0;
  const storedChildrenLength = stored.children?.length ?? 0;

  if(sentChildrenLength > 0 || fetchedChildrenLength > 0 || storedChildrenLength > 0) {
    expect(fetchedChildrenLength).toEqual(sentChildrenLength)
    expect(storedChildrenLength).toEqual(sentChildrenLength)
    stored.children?.forEach((storedChild, index) => {
      const fetchedChild = (fetched as Unit)?.children?.find((child) => child.id === storedChild.id)
      expect(fetchedChild).toBeDefined()
      expect(storedChild).toBeDefined()
      const sentChild = (sent?.children ?? [])[index];
      expect(sentChild).toBeDefined()
      if(sentChild && fetchedChild && storedChild) {
        testFetchedUnit(sentChild as UnitCreateResponse, storedChild, fetchedChild, `${testName ? `${testName} ` : ""}Child`)
      }
    })
  }
}

const testAddedAttribute = (updated: Unit | null, attributeToAdd: AttributeCreate<AnyAttribute>) => {
  expect(updated).not.toBeNull()
  updated = updated as Unit;
  log({ updated, attributeToAdd })
  const addedAttribute = (updated.attributes ?? []).find(attribute => attribute.type === attributeToAdd.type) ?? null;
  testFetchedAttribute(attributeToAdd, addedAttribute);
}

const runUnitTests = (db: Database, sentUnit: UnitCreate, unitName: string) => {
  let storedUnit: UnitCreateResponse;
  let fetchedUnit: Unit | null;
  let addedAttribute: AttributeCreate<AnyAttribute>;

  describe(`Unit ${unitName}`, () => {
    test("stored", () => {
      storedUnit = db.storeUnit(sentUnit);
      testStoredUnit(sentUnit, storedUnit);
    })
    test("fetched", () => {
      fetchedUnit = db.fetchUnit(storedUnit.id)
      testFetchedUnit(sentUnit, storedUnit, fetchedUnit)
    })
    test("added comment attribute", () => {
      const unitLabel = ((sentUnit.attributes ?? []).find((attribute) =>
        typeof attribute !== "string" && attribute.type === "label"
      ) as AttributeCreate<LabelAttribute> | undefined)?.label;
      addedAttribute = (unitLabel
        ? {type: "comment", comment: `Comment: Unit with label: ${unitLabel}`}
        : mockRepo.attributes.comment) as AttributeCreate<CommentAttribute>;

      fetchedUnit = db.addAttributeToUnit(storedUnit.id, addedAttribute)
      testAddedAttribute(fetchedUnit, addedAttribute)
    })
  })
}

export const runAllUnitTests = (db: Database) => {
  describe("All Units", () => {
    const keys = Object.keys(mockRepo.units);
    keys.forEach((key) => {
      const unit = mockRepo.units[key as keyof MockRepo["units"]];
      runUnitTests(db, unit, key)
    })
  })
}