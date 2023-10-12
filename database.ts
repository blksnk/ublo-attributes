
import { createUuid } from "./utils";
import type {
  AddressAttribute,
  AnyAttribute, Attribute,
  AttributeCreate, AttributeType, LabelAttribute, PriceAttribute
} from "./types/attributes";
import type { DatabaseUnit, Unit, UnitCreate } from "./types/units";
import type {
  AttributeMapping,
  AttributeMappingMap,
  AttributeRepository, AttributeTypeMap,
  UnitDatabaseMap, uuid
} from "./types/database";
import { UnitCreateResponse } from "./types/units";

export class Database {
  units: UnitDatabaseMap;
  attributeMap: AttributeMappingMap;
  attributeRepository: AttributeRepository;

  constructor() {
    this.units = new Map();
    this.attributeMap = new Map();
    this.attributeRepository = {
      address: new Map(),
      label: new Map(),
      price: new Map(),
    }
  }

  public storeAttribute<TAttribute extends AnyAttribute>(createAttribute: AttributeCreate<TAttribute>): TAttribute {
    const attributeId = createUuid();
    const attribute = {
      ...createAttribute,
      id: attributeId
    };
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
  public storeUnit (createUnit: UnitCreate): UnitCreateResponse {
    const unitId = createUuid();
    const attributesIds = createUnit?.attributes?.map(attributeOrId => {
      if(typeof attributeOrId === "string") {
        const mapResult = this.attributeMap.get(attributeOrId);
        if(mapResult) return attributeOrId
        throw new Error(`Attribute with map id ${attributeOrId} not found`);
      }
      // TODO: check for duplicates
      return this.storeAttribute(attributeOrId).id;
    })
    const children = createUnit?.children?.map(childOrId => {
      if(typeof childOrId === "string") {
        const mapResult = this.units.get(childOrId);
        if(mapResult) return mapResult
        throw new Error(`Unit with id ${childOrId} not found`);
      }
      return this.storeUnit(childOrId)
    })

    const unit: DatabaseUnit = {
      id: unitId,
    }
    if(attributesIds) unit.attributesIds = attributesIds;
    if(children) unit.childrenIds = children.map(({ id }) => id);
    this.units.set(unitId, unit);
    return {
      id: unitId,
      attributesIds,
      children,
    };
  }

  public fetchAttribute<TAttribute extends AnyAttribute> (attributeMappingId: uuid): TAttribute | null {
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
    return attribute as TAttribute;
  }

  public fetchUnit(unitId: uuid): Unit | null {
    const u = this.units.get(unitId);
    if(!u) {
      console.warn(`Unit with id ${unitId} not found`);
      return null;
    }
    const attributes = u.attributesIds
      ?.map(attributeId => this.fetchAttribute(attributeId))
      .filter(attribute => attribute!== null) as AnyAttribute[] | undefined;
    const children = u.childrenIds
      ?.map(childId => this.fetchUnit(childId))
      .filter(child => child !== null) as Unit[] | undefined;
    const unit: Unit = {
      id: u.id,
    }
    if(attributes) unit.attributes = attributes;
    if(children) unit.children = children;
    return unit
  }

  public fetchAllAttributes = (type?: AttributeType, limit?: number): AnyAttribute[] => {
    const l = limit ? limit : Infinity;
    let i = 0;
    const attributes: AnyAttribute[] = [];
    if(type) {
      const map = this.attributeRepository[type];
      for (let value of map.values()) {
        if(i >= l) break;
        attributes.push(value)
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
}
