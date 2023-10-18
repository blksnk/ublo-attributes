
import { createUuid } from "../utils";
import type {
  AddressAttribute,
  AnyAttribute,
  AttributeType,
  CommentAttribute,
  LabelAttribute,
  PriceAttribute
} from "../types/attributes";
import type { DatabaseUnit, Unit } from "../types/units";
import type {
  AttributeMapping,
  AttributeMappingMap,
  AttributeRepository,
  UnitDatabaseMap, uuid
} from "../types/database";
import { AttributeTypes } from "../types/attributes";
import { DatabaseShared } from "../types/database";

export class RuntimeDatabase implements DatabaseShared {
  units: UnitDatabaseMap;
  attributeMap: AttributeMappingMap;
  attributeRepository: AttributeRepository;

  constructor() {
    this.units = new Map();
    this.attributeMap = new Map();
    this.attributeRepository = Object.fromEntries(AttributeTypes.map(type => [type, new Map()])) as unknown as AttributeRepository;
  }

  public async storeAttribute<TAttribute extends AnyAttribute>(createAttribute) {
    const attributeId = createUuid();
    const attribute = {
      ...createAttribute,
      id: attributeId
    } as TAttribute;

    switch(attribute.type) {
      case "address":
        this.attributeRepository.address.set(attributeId, attribute as unknown as AddressAttribute);
        break;
      case "label":
        this.attributeRepository.label.set(attributeId, attribute as unknown as LabelAttribute);
        break;
      case "price":
        this.attributeRepository.price.set(attributeId, attribute as unknown as PriceAttribute);
        break;
      case "comment":
        this.attributeRepository.comment.set(attributeId, attribute as unknown as CommentAttribute);
        break;
      default: throw new Error("Unknown attribute type");
    }

    const attributeMapping: AttributeMapping = [attribute.type, attribute.id];
    const attributeMappingId = createUuid();
    this.attributeMap.set(attributeMappingId, attributeMapping);

    return {
      ...attribute,
      id: attributeMappingId
    } as TAttribute;
  }

  public async storeUnit (createUnit) {
    const unitId = createUuid();
    const attributeIds = await Promise.all(createUnit?.attributes?.map(async (attributeOrId) => {
      if(typeof attributeOrId === "string") {
        const mapResult = this.attributeMap.get(attributeOrId);
        if(mapResult) return attributeOrId
        throw new Error(`Attribute with map id ${attributeOrId} not found`);
      }
      // TODO: check for duplicates
      return (await this.storeAttribute(attributeOrId)).id;
    }) ?? [])
    const children = await Promise.all(createUnit?.children?.map(async (childOrId) => {
      if(typeof childOrId === "string") {
        const mapResult = this.units.get(childOrId);
        if(mapResult) return mapResult
        throw new Error(`Unit with id ${childOrId} not found`);
      }
      return await this.storeUnit(childOrId)
    }) ?? [])

    const unit: DatabaseUnit = {
      id: unitId,
    }
    if(attributeIds) unit.attributeIds = attributeIds;
    if(children) unit.childrenIds = children.map(({ id }) => id);
    this.units.set(unitId, unit);
    return {
      id: unitId,
      attributeIds,
      children,
    };
  }

  public async fetchAttribute<TAttribute extends AnyAttribute> (attributeMappingId) {
    const mapResult = this.attributeMap.get(attributeMappingId);
    if(!mapResult) {
      console.warn(`Attribute with mapping id ${attributeMappingId} not found`);
      return null;
    }
    const [attributeType, attributeId] = mapResult;
    const attribute = this.attributeRepository[attributeType].get(attributeId);
    if(!attribute) {
      console.warn(`Attribute with type ${attributeType} & id ${attributeId} not found`);
      return null;
    }
    return {
      ...attribute,
      id: attributeMappingId,
    } as TAttribute;
  }

  public async fetchUnit(unitId) {
    const u = this.units.get(unitId);
    if(!u) {
      console.warn(`Unit with id ${unitId} not found`);
      return null;
    }
    const attributes = (await Promise.all(u.attributeIds
      ?.map(async (attributeId) => await this.fetchAttribute(attributeId)) ?? []))
      .filter(attribute => attribute!== null) as AnyAttribute[] | undefined;
    const children = (await Promise.all(u.childrenIds
      ?.map(async (childId) => await this.fetchUnit(childId)) ?? []))
      .filter(child => child !== null) as Unit[] | undefined;
    return {
      id: u.id,
      attributes: attributes ?? [],
      children: children ?? [],
    } as Unit
  }

  public fetchAllAttributes = (type?: AttributeType, limit?: number): AnyAttribute[] => {
    const l = limit ? limit : Infinity;
    let i = 0;
    const attributes: AnyAttribute[] = [];
    if(type) {
      const map = this.attributeRepository[type];
      for (let value of map.values()) {
        if(i >= l) break;
        attributes.push(value as AnyAttribute)
        i++
      }
      return attributes;
    }

    const all = Object.values(this.attributeRepository).flatMap(map => [...map.values()])
    for(let value of all) {
      if(i >= l) break;
      attributes.push(value)
      i++
    }
    return attributes;
  }

  private async addAttributeMapIdToUnit(unitId: uuid, attributeMapId: uuid) {
    const storedAttributeMapping = this.attributeMap.get(attributeMapId)
    if(!storedAttributeMapping) {
      console.error(`No attributeMapping found with id ${ attributeMapId }`);
      return null;
    }
    const storedUnit = this.units.get(unitId);
    if(!storedUnit) {
      console.error(`No unit found with id ${ unitId }}`)
      return null;
    }

    const hasSameTypeAttribute = storedUnit.attributeIds && storedUnit.attributeIds.some(attributeId => {
      const mapping = this.attributeMap.get(attributeId);
      if(!mapping) return false;
      const [attributeType] = mapping;
      return attributeType === storedAttributeMapping[0];
    })
    if(hasSameTypeAttribute) {
      console.error(`Unit already as attribute with type ${storedAttributeMapping[0]}`);
      return null;
    }

    const unitAttributeIds = [
      ...(storedUnit.attributeIds ?? []),
      attributeMapId,
    ]
    const updatedUnit = {
      ...storedUnit,
      attributeIds: unitAttributeIds,
    }
    this.units.set(unitId, updatedUnit);

    return await this.fetchUnit(unitId);
  }

  public async addAttributeToUnit(unitId, createAttributeOrId) {
    // try adding id if provided
    if (typeof createAttributeOrId === "string") {
      return await this.addAttributeMapIdToUnit(unitId, createAttributeOrId);
    }

    const unit = await this.fetchUnit(unitId)
    if (!unit) {
      console.error(`No unit found with id ${ unitId }`);
      return null;
    }
    // abort if unit already has same attribute;
    const hasSameTypeAttribute = unit.attributes && unit.attributes.some(attribute => attribute.type === createAttributeOrId.type);
    if(hasSameTypeAttribute) {
      console.error(`Unit already has attribute with type ${ createAttributeOrId.type }`);
      return null;
    }
    // create new attribute
    const storedAttribute = await this.storeAttribute(createAttributeOrId);

    // add its id to unit
    return await this.addAttributeMapIdToUnit(unitId, storedAttribute.id)
  }
}

export const db = new RuntimeDatabase();