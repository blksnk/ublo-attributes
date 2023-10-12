import {describe, expect, test} from '@jest/globals';
import { Database } from "../database";
import { MockRepo, mockRepo } from "./database.mock";

import { runAllUnitTests } from "./units.test";
import { runAllAttributeTests } from "./attributes.test";


const database = new Database();

describe("Database", () => {
  runAllAttributeTests(database)

  runAllUnitTests(database)


  describe("throws on", () => {
    test("unknown attribute", () => {
      expect(() => database.storeAttribute({
        ...mockRepo.attributes.address,
        type: "unsupported"
      } as unknown as MockRepo["attributes"]["address"])).toThrow()
    })
  })
})