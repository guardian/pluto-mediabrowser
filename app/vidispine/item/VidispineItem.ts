import VidispineItemTI from "./VidispineItem-ti";
import VidispineShapeTI from "../shape/VidispineShape-ti";
import CustomDataTI from "../field-group/CustomData-ti";
import VidispineFileTI from "../shape/VidispineFile-ti";
import { createCheckers } from "ts-interface-checker";
import {
  VidispineShapeIF,
  VidispineShape,
  VidispineShapeChecker,
} from "../shape/VidispineShape";

interface URIList {
  uri: string[];
}

interface MetadataValue {
  value: string;
  uuid?: string;
  user?: string;
  timestamp?: string;
  change?: string;
}

interface MetadataField {
  name: string;
  value: MetadataValue[];
  uuid?: string;
  user?: string;
  timestamp?: string;
  change?: string;
}

interface MetadataGroup {
  name: string;
  field: MetadataField[];
}

interface MetadataTimespan {
  field: MetadataField[];
  group: MetadataGroup[];
  start: string;
  end: string;
}

interface ItemMetadata {
  revision: string;
  timespan: MetadataTimespan[];
}

interface ItemIF {
  metadata?: ItemMetadata;
  shape?: VidispineShapeIF[];
  files?: URIList;
  id: string;
}

interface ItemResponse {
  item: ItemIF[];
}

const {
  MetadataValue,
  MetadataField,
  MetadataGroup,
  MetadataTimespan,
  ItemMetadata,
  ItemIF,
  ItemResponse,
} = createCheckers(
  VidispineItemTI,
  VidispineShapeTI,
  CustomDataTI,
  VidispineFileTI
);

/**
 * Main vidispine item class.  This defines a group of useful methods for retrieving metadata values from the overall
 * document structure
 */
class VidispineItem implements ItemIF {
  metadata?: ItemMetadata;
  shape?: VidispineShape[];
  id: string;
  files?: URIList;

  /**
   * constructs the class from a raw object
   * @param sourceObject, if this does not validate then VError is thrown
   */
  constructor(sourceObject: any) {
    let bareObject = {
      id: sourceObject.hasOwnProperty("id") ? sourceObject.id : undefined,
    };
    ItemIF.check(bareObject);

    this.metadata = sourceObject.metadata;
    this.shape = sourceObject.hasOwnProperty("shape")
      ? sourceObject.shape
          .map((s: VidispineShapeIF) => {
            try {
              return new VidispineShape(s, true);
            } catch (e) {
              const loggedId = s.id ?? "unknown-id";
              console.warn(`Shape ${loggedId} did not validate: `, e);
              return null;
            }
          })
          .filter((maybeShape: VidispineShapeIF | null) => maybeShape != null)
      : undefined;
    this.files = sourceObject.files;
    this.id = sourceObject.id;
  }

  /**
   * perform a validation as a Shape object for each item in the given list.
   * only validated ones are returned
   * @param sourceShapes
   */
  validateSourceShapes(sourceShapes: any[]): VidispineShapeIF[] {
    return <VidispineShapeIF[]>sourceShapes
      .map((maybeShape) => {
        try {
          VidispineShapeChecker.check(maybeShape);
          return <VidispineShapeIF>maybeShape;
        } catch (e) {
          const presentableId = maybeShape.hasOwnProperty("id")
            ? maybeShape.id
            : "unknown-id";
          console.warn(`Source shape ${presentableId} did not validate: `, e);
          return null;
        }
      })
      .filter((maybeShape) => maybeShape !== null);
  }

  /**
   * convenience method that calls getMetadataValuesInGroup with no group specified, i.e. finds the metadata values
   * for a field in the root group
   * @param forKey field name that you want to get metadata for
   * @return same as for getMetadataValuesInGroup
   */
  getMetadataValues(forKey: string): Array<string> | undefined {
    return this.getMetadataValuesInGroup(forKey, undefined);
  }

  /**
   * convenience method that calls getMetadataInGroup and strips out all excess information, simply returning
   * the values as an array of strings.
   * @param forKey the field name that you want to get metadata for
   * @param inGroup inGroup optionally, the name of a group to locate the field in
   * @return either an array of metadata values for the field (which can be empty) or undefined if the field or group
   *    do not exist within the metadata response
   */
  getMetadataValuesInGroup(
    forKey: string,
    inGroup: string | undefined
  ): string[] | undefined {
    const metavalues = this.getMetadataInGroup(forKey, inGroup);
    return metavalues ? metavalues.map((entry) => entry.value) : undefined;
  }

  /**
   * convenience method that will coalesce all values into a string joined by a comma separator
   * @param forKey
   */
  getMetadataString(forKey: string): string | undefined {
    const possibleValues = this.getMetadataValuesInGroup(forKey, undefined);
    if (possibleValues) {
      return possibleValues.join(", ");
    } else {
      return undefined;
    }
  }

  /**
   * searches the default timespan for metadata entries metching the given key, optionally within the given group.
   * @param forKey the field name that you want to get metadata for
   * @param inGroup optionally, the name of a group to locate the field in
   * @return either an array of matching MetadataValue entries (which can be an empty array if the field exists with
   *       no values) or undefined if the field or key do not exist within the metadata response
   */
  getMetadataInGroup(
    forKey: string,
    inGroup: string | undefined
  ): MetadataValue[] | undefined {
    const timespan = this.getDefaultTimespan();
    if (!timespan) return undefined;

    let fieldset: MetadataField[];

    if (inGroup) {
      const groupref = this.getGroup(inGroup, timespan);
      if (!groupref) return undefined;
      fieldset = groupref.field;
    } else {
      fieldset = timespan.field;
    }

    const values = fieldset
      .filter((f) => f.name === forKey)
      .map((f) => f.value);

    if (values.length === 0) return undefined;
    return values.reduce((acc, elem) => acc.concat(...elem));
  }

  /**
   * gets the group with the given name in the given timespan.
   * if multiple groups match, the first is returned and an error emitted to console
   * @param groupName name of the group to search for
   * @param timespan timespan to search in
   */
  getGroup(
    groupName: string,
    timespan: MetadataTimespan
  ): MetadataGroup | undefined {
    const potentialGroups = timespan.group.filter((g) => g.name === groupName);
    if (potentialGroups.length == 0) {
      return undefined;
    } else if (potentialGroups.length > 1) {
      console.warn(
        `VidispineItem::getGroup - ${potentialGroups.length} groups were found for ${groupName}`
      );
    }
    return potentialGroups[0];
  }

  /**
   * returns a simple boolean indicating whether the item has a given group on it
   * @param groupName group to search for
   * @param timespan optional timspan to search in, if not set the default timespan is used
   */
  hasGroup(groupName: string, timespan?: MetadataTimespan): boolean {
    const timespanForLookup = timespan ?? this.getDefaultTimespan();
    if (timespanForLookup && timespanForLookup.group) {
      return (
        timespanForLookup.group.filter((group) => group.name === groupName)
          .length > 0
      );
    } else {
      return false;
    }
  }

  /**
   * returns the "default" timespan:
   * - if there is only one timespan, that one
   * - if there are multiple timespans, the one that has a start and end at "-INF" and "+INF" respectively
   * - if there are multiple timespans running from "-INF" to "+INF" then a RangeError is thrown
   */
  getDefaultTimespan(): MetadataTimespan | undefined {
    if (this.metadata) {
      if (this.metadata.timespan.length === 0) {
        return undefined;
      } else if (this.metadata.timespan.length === 1) {
        return this.metadata.timespan[0];
      } else {
        const potentialTimespans = this.metadata.timespan.filter(
          (timespan) => timespan.start === "-INF" && timespan.end === "+INF"
        );
        if (potentialTimespans.length === 0) {
          return undefined;
        } else if (potentialTimespans.length === 1) {
          return potentialTimespans[0];
        } else {
          const err = new RangeError();
          err.message =
            "Multiple default timespans existed? This is incorrect.";
          throw err;
        }
      }
    } else {
      return undefined;
    }
  }

  /**
   * returns an array of strings representing the names of the groups mentioned in the document.
   * This is an empty list if either the timespan does not exist or there are no group entries.
   */
  getGroupNames(): string[] {
    const ts = this.getDefaultTimespan();
    if (ts == undefined) return [];

    return ts.group.map((g) => g.name);
  }

  /**
   * finds an attached shape matching the given shape tag
   * @param shapeTagName shape tag name to search for
   * @returns undefined if there is no shape data in this VidispineItem. An array of VidispineShape otherwise, which can
   * be empty if there are no matching shapes present.
   */
  findShape(shapeTagName: string): VidispineShape[] | undefined {
    if (this.shape) {
      return this.shape.filter((shape) => shape.tag.includes(shapeTagName));
    } else {
      return undefined;
    }
  }
}

/**
 * takes an untyped object from JSON.parse, validates it and returns an array of VidispineItems.
 * if it fails to validate as an ItemResponse, then an exception is thrown describing the syntax issue
 * @param content decoded json object
 * @returns an erray of VidispineItems (which might be empty) or throws an error
 */
function GetItems(content: object): Array<VidispineItem> {
  const itemresponse = <ItemResponse>content;

  return itemresponse.item.map((rawitem) => new VidispineItem(rawitem));
}

export type {
  ItemResponse,
  ItemIF,
  MetadataValue,
  MetadataField,
  MetadataGroup,
  MetadataTimespan,
  ItemMetadata,
};

export { GetItems, VidispineItem };
