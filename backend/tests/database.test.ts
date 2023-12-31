import { describe, expect, test } from '@jest/globals';
import { MockRepo, mockRepo } from "./database.mock";

import { runAllUnitTests } from "./units.test";
import { runAllAttributeTests } from "./attributes.test";
import { log } from "../utils";
import { createDatabase } from "../database/index.database";


describe("Runtime Database", () => {
  const database = createDatabase("runtime")
  runAllAttributeTests(database)
  runAllUnitTests(database)


  describe("throws on", () => {
    test("unknown attribute", async () => {
      await expect(async () => await database.storeAttribute({
        ...mockRepo.attributes.address,
        type: "unsupported"
      } as unknown as MockRepo["attributes"]["address"])).toThrow()
    })
  })

  test("logs database", () => {

    expect(() => log({ database })).not.toThrow()
  })
})

describe("Psql Database",() => {
  const database = createDatabase("psql")
  runAllAttributeTests(database)
  runAllUnitTests(database)

  describe("throws on", () => {
    test("unknown attribute", () => {
      expect(async () => await database.storeAttribute({
        ...mockRepo.attributes.address,
        type: "unsupported"
      } as unknown as MockRepo["attributes"]["address"])).toThrow()
    })
  })
})