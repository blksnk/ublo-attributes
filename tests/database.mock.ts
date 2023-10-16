import {
  AddressAttribute,
  AttributeCreate,
  CommentAttribute,
  LabelAttribute,
  PriceAttribute
} from "../types/attributes";
import { UnitCreate } from "../types/units";

export type MockRepo = {
  attributes: {
    address: AttributeCreate<AddressAttribute>;
    label: AttributeCreate<LabelAttribute>;
    price: AttributeCreate<PriceAttribute>;
    comment: AttributeCreate<CommentAttribute>;
  };
  units: {
    [k: string]: UnitCreate;
  };
}

export const mockRepo: MockRepo = {
  attributes: {
    address: {
      type: "address",
      number: "123",
      street: "street",
      city: "city",
      zip: "zip",
      country: "country",
    },
    label: {
      type: "label",
      label: "Label",
    },
    price: {
      type: "price",
      price: 100000,
    },
    comment: {
      type: "comment",
      comment: "This is a comment",
    }
  },
  units: {},
}
mockRepo.units = {
  empty: {
  },
  simple: {
    attributes: [
      {
        ...mockRepo.attributes.label,
        label: "Simple unit"
      } as MockRepo["attributes"]["label"],
    ]
  },
  withChildren: {
    attributes: [
      {
        ...mockRepo.attributes.label,
        label: "Parent unit"
      } as MockRepo["attributes"]["label"],
    ],
    children: [
      {
        attributes: [
          {
            ...mockRepo.attributes.label,
            label: "Child unit with address"
          } as MockRepo["attributes"]["label"],
          mockRepo.attributes.address
        ],
        children: [
          {
            attributes: [
              {
                ...mockRepo.attributes.label,
                label: "nested child"
              } as MockRepo["attributes"]["label"]
            ]
          },
        ]
      }
    ]
  }
}