
import type {
  AnyAttribute,
  AttributeCreate,
} from "../types/attributes";
import type {
  DatabaseUnit,
  Unit,
  UnitCreate
} from "../types/units";
import type {
  uuid
} from "../types/database";
import { UnitCreateResponse } from "../types/units";
import { PsqlClient } from "../psql/client";

export class PsqlDatabase {
  client: PsqlClient;

  constructor() {
    this.client = new PsqlClient()
  }

  public async storeAttribute<TAttribute extends AnyAttribute>(attribute: AttributeCreate<TAttribute>): Promise<TAttribute> {
    const attributeId = await this.client.insertAttribute(attribute);
    const attributeMappingId = await this.client.insertAttributeMapping([attribute.type, attributeId]);
    return {
      ...attribute,
      id: attributeMappingId
    } as TAttribute;
  }

  public async fetchAttribute(attributeMappingId: uuid): Promise<AnyAttribute | null> {
    const attributeMapping = await this.client.retrieveAttributeMapping(attributeMappingId);

    if (!attributeMapping) {
      console.warn(`Attribute with mapping id ${attributeMappingId} not found`);
      return null;
    }
    const attribute = await this.client.retrieveAttribute<AnyAttribute>(attributeMapping)
    if (!attribute) {
      console.warn(`Attribute with type ${attributeMapping[0]} & id ${attributeMapping[1]} not found`);
      return null;
    }
    return {
      ...attribute,
      id: attributeMappingId,
    } as AnyAttribute;
  }

  public async storeUnit (unit: UnitCreate): Promise<UnitCreateResponse> {
    // store attributes and children if present,
    const attributeIds: uuid[] = await Promise.all(unit.attributes?.map(async (attributeOrId) => {
      if (typeof attributeOrId === "string") {
        // check if valid attribute mapping id was provided
        const attributeMapping = await this.client.retrieveAttributeMapping(attributeOrId)
        if (!attributeMapping)throw new Error("Tried to link inexistant attribute to new unit")
        // check if other referenced attribute has same type counterpart in payload
        if ((unit.attributes ?? []).filter(attr => typeof attr !== "string").includes(attributeMapping[0]))
          throw new Error("Tried to add more than one attribute of the same type: " + attributeMapping[0])
        // check if valid attribute id was provided
        const attributeId = (await this.client.retrieveAttribute(attributeMapping))?.id;
        if (!attributeId) throw new Error("Tried to link inexistant attribute to new unit")
        return attributeId;
      }
      return (await this.storeAttribute(attributeOrId)).id
    }) ?? [])

    const children: (DatabaseUnit | UnitCreateResponse)[] = await Promise.all(unit.children?.map(async (childOrId) => {
      if (typeof childOrId === "string") {
        // TODO: check for duplicates
        const childId = (await this.client.retrieveUnit(childOrId))
        if (!childId) throw new Error("Tried to link inexistant child to new unit");
        return childId;
      }
      return await this.storeUnit(childOrId)
    }) ?? [])

    const childrenIds: uuid[] = children.map(({ id }) => id);
    const unitId = await this.client.insertUnit({
      attributeIds,
      childrenIds,
    });

    return {
      id: unitId,
      attributeIds,
      children
    } as UnitCreateResponse;
  }

  public async fetchUnit(unitId: uuid): Promise<Unit | null> {
    const dbUnit = await this.client.retrieveUnit(unitId);
    if (!dbUnit) return null;

    const attributes = (await Promise.all(dbUnit.attributeIds?.map(async (attributeId) => {
      return await this.fetchAttribute(attributeId);
    }) ?? [])).filter(attribute => attribute !== null) as AnyAttribute[];

    const children = (await Promise.all(dbUnit.childrenIds?.map(async (childId) => {
      return await this.fetchUnit(childId);
    }) ?? [])).filter(child => child !== null) as Unit[];

    return {
      id: unitId,
      attributes,
      children,
    } as Unit;
  }

  // private addAttributeMapIdToUnit(unitId: uuid, attributeMapId: uuid) {
  //   const storedAttributeMapping = this.attributeMap.get(attributeMapId)
  //   if(!storedAttributeMapping) {
  //     console.error(`No attributeMapping found with id ${ attributeMapId }`);
  //     return null;
  //   }
  //   const storedUnit = this.units.get(unitId);
  //   if(!storedUnit) {
  //     console.error(`No unit found with id ${ unitId }}`)
  //     return null;
  //   }
  //
  //   const hasSameTypeAttribute = storedUnit.attributeIds && storedUnit.attributeIds.some(attributeId => {
  //     const mapping = this.attributeMap.get(attributeId);
  //     if(!mapping) return false;
  //     const [attributeType] = mapping;
  //     return attributeType === storedAttributeMapping[0];
  //   })
  //   if(hasSameTypeAttribute) {
  //     console.error(`Unit already as attribute with type ${storedAttributeMapping[0]}`);
  //     return null;
  //   }
  //
  //   const unitAttributeIds = [
  //     ...(storedUnit.attributeIds ?? []),
  //     attributeMapId,
  //   ]
  //   const updatedUnit = {
  //     ...storedUnit,
  //     attributeIds: unitAttributeIds,
  //   }
  //   this.units.set(unitId, updatedUnit);
  //
  //   return this.fetchUnit(unitId);
  // }
  //
  // public addAttributeToUnit<TAttribute extends AnyAttribute>(unitId: uuid, createAttributeOrId: AttributeCreate<TAttribute> | uuid): Unit | null {
  //   // try adding id if provided
  //   if(typeof createAttributeOrId === "string") {
  //     return this.addAttributeMapIdToUnit(unitId, createAttributeOrId);
  //   }
  //
  //   const unit = this.fetchUnit(unitId)
  //   if(!unit) {
  //     console.error(`No unit found with id ${ unitId }`);
  //     return null;
  //   }
  //   // abort if unit already has same attribute;
  //   const hasSameTypeAttribute = unit.attributes && unit.attributes.some(attribute => attribute.type === createAttributeOrId.type);
  //   if(hasSameTypeAttribute) {
  //     console.error(`Unit already has attribute with type ${ createAttributeOrId.type }`);
  //     return null;
  //   }
  //   // create new attribute
  //   const storedAttribute = this.storeAttribute(createAttributeOrId);
  //
  //   // add its id to unit
  //   return this.addAttributeMapIdToUnit(unitId, storedAttribute.id)
  // }
}