import { createCheckers } from "ts-interface-checker";
import VidispineFieldGroupTI from "./VidispineFieldGroup-ti";
import { GetPlutoCustomData, PlutoCustomData } from "./CustomData";
import axios from "axios";

interface StringRestriction {
  minLength?: number;
  maxLength?: number;
}

interface Schema {
  min: number;
  max: number;
  name: string;
}

interface DataPair {
  key: string;
  value: string;
}

interface VidispineFieldIF {
  name: string;
  schema: Schema;
  type: string; //FIXME: set allowed values of this
  stringRestriction?: StringRestriction;
  data?: DataPair[];
  defaultValue?: any;
  origin?: string;
}

interface VidispineFieldGroupIF {
  name: string;
  schema: Schema;
  field: VidispineFieldIF[];
  origin?: string;
  inheritance?: string; //while actually a boolean value that is encoded as a string
}

const {
  StringRestriction,
  Schema,
  DataPair,
  VidispineFieldIF,
  VidispineFieldGroupIF,
} = createCheckers(VidispineFieldGroupTI);

/**
 * helper class that has a bunch of useful methods for interacting with the field
 */
class VidispineField implements VidispineFieldIF {
  name: string;
  schema: Schema;
  type: string;
  stringRestriction?: StringRestriction;
  data?: DataPair[];
  defaultValue?: any;
  origin?: string;

  constructor(sourceObject: object) {
    //throws an exception if sourceObject does not validate
    VidispineFieldIF.check(sourceObject);
    const sourceField = <VidispineFieldIF>sourceObject;

    this.name = sourceField.name;
    this.schema = sourceField.schema;
    this.type = sourceField.type;
    this.stringRestriction = sourceField.stringRestriction;
    this.data = sourceField.data;
    this.defaultValue = sourceField.defaultValue;
    this.origin = sourceField.defaultValue;
  }

  /**
   * returns the PlutoCustomData block for the field, or undefined if it does not exist.
   * can throw an exception if the data block is not valid json or it fails structural validation
   */
  getCustomData(): PlutoCustomData | undefined {
    const extradata = this.getDataValue("extradata");
    if (extradata == undefined) return undefined;

    const parsed_data = JSON.parse(extradata);
    return GetPlutoCustomData(parsed_data);
  }

  /**
   * returns the value of the given custom data key as a string, or undefined if it does not exist
   * @param forKey the data key to look for
   */
  getDataValue(forKey: string): string | undefined {
    if (this.data == undefined) return undefined;

    const datanodes = this.data.filter((pair) => pair.key === forKey);
    if (datanodes.length == 0) return undefined;

    return datanodes[0].value;
  }

  /**
   * tests whether the given string meets the restrictions placed on it
   * @param target string to test
   * @return a boolean value, true if the string validates, false if it does not.
   */
  validateString(target: string): boolean {
    if (this.stringRestriction == undefined) return true; //no restrictions

    const stringlen = target.length;
    if (this.stringRestriction.minLength && this.stringRestriction.maxLength) {
      return (
        stringlen >= this.stringRestriction.minLength &&
        stringlen <= this.stringRestriction.maxLength
      );
    } else if (this.stringRestriction.minLength) {
      return stringlen >= this.stringRestriction.minLength;
    } else if (this.stringRestriction.maxLength) {
      return stringlen <= this.stringRestriction.maxLength;
    } else {
      return true;
    }
  }
}

class VidispineFieldGroup implements VidispineFieldGroupIF {
  name: string;
  schema: Schema;
  field: VidispineFieldIF[];
  origin?: string;
  inheritance?: string; //while actually a boolean value that is encoded as a string

  /**
   * construct a VidispineFieldGroup from an unchecked object.
   * checks that the provided object actually is a VidispineFieldGroup and throws an exception if not.
   * otherwise, copies the data and returns this object.
   * alternatively, if you _know_ that a given piece of data is a VidispineFieldGroupIF you can
   * simply cast it to VidispineFieldGroup: const g = <VidispineFieldGroup>groupdata; or
   * const g = groupdata as VidispineFieldGroup.  This will reference rather than copy.
   * @param sourceObject object to copy.
   */
  constructor(sourceObject: object) {
    VidispineFieldGroupIF.check(sourceObject);
    const sourceGroup = <VidispineFieldGroupIF>sourceObject;

    this.name = sourceGroup.name;
    this.schema = sourceGroup.schema;
    this.field = sourceGroup.field;
    this.origin = sourceGroup.origin;
    this.inheritance = sourceGroup.inheritance;
  }

  /**
   * returns a VidispineField object corresponding to the given field name.
   * returns undefined if no such field exists in the group.
   * @param fieldname the field name to search for
   */
  getField(fieldname: string): VidispineField | undefined {
    const potentialFields = this.field.filter((f) => f.name === fieldname);
    if (potentialFields.length == 0) return undefined;

    return <VidispineField>potentialFields[0];
  }

  /**
   * generator that yields a VidispineField object for all the fields in the group
   */
  *getAllFields(): Generator<VidispineField> {
    //doing this with foreach() does not work, because foreach expects a function which is NOT a generator.
    //a very basic iteration loop here has no embedded anonymous function and therefore is free to yield
    for (let i = 0; i < this.field.length; i++) {
      yield <VidispineField>this.field[i];
    }
  }
}

/**
 * loads in the given group from the server. Returns a Promise<VidispineFieldGroup> if successful or a failed promise
 * if the data is invalid or a server error occurred. Inspect the thrown value to find out what happened.
 * @param baseUrl Vidispine server base URL
 * @param groupname name of the group to load in
 */
async function LoadGroupFromServer(
  baseUrl: string,
  groupname: string
): Promise<VidispineFieldGroup> {
  console.log("Loading ", groupname);
  const url = baseUrl + `/API/metadata-field/field-group/${groupname}`;
  const result = await axios.get(url);
  console.log("got", result.data);

  try {
    return new VidispineFieldGroup(result.data);
  } catch (err) {
    console.error(err);
    console.error(
      `Could not load ${groupname} from ${url} - data validation failed because of ${err.toString()}`
    );
    return Promise.reject("invalid data from server");
  }
}

export type { DataPair }; //used by CustomData
export { VidispineField, VidispineFieldGroup, LoadGroupFromServer };
