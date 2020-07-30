import { createCheckers } from "ts-interface-checker";
import VidispineFieldGroupTI from "./VidispineFieldGroup-ti";
import {GetPlutoCustomData, PlutoCustomData} from "./CustomData";

interface StringRestriction {
    minLength: number;
    maxLength: number;
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
    type: string;   //FIXME: set allowed values of this
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
    inheritance?: string;   //while actually a boolean value that is encoded as a string
}

const {
    StringRestriction,
    Schema,
    DataPair,
    VidispineFieldIF,
    VidispineFieldGroupIF
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

    constructor(sourceObject:object) {
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
    getCustomData():PlutoCustomData | undefined {
        const extradata = this.getDataValue("extradata");
        if(extradata==undefined) return undefined;

        const parsed_data = JSON.parse(extradata);
        return GetPlutoCustomData(parsed_data);
    }

    /**
     * returns the value of the given custom data key as a string, or undefined if it does not exist
     * @param forKey the data key to look for
     */
    getDataValue(forKey:string):string | undefined {
        if(this.data==undefined) return undefined;

        const datanodes = this.data.filter(pair=>pair.key===forKey);
        if(datanodes.length==0) return undefined;

        return datanodes[0].value;
    }

    /**
     * tests whether the given string meets the restrictions placed on it
     * @param target string to test
     * @return a boolean value, true if the string validates, false if it does not.
     */
    validateString(target:string):boolean {
        if(this.stringRestriction==undefined) return true;  //no restrictions

        const stringlen = target.length;
        return stringlen>=this.stringRestriction.minLength && stringlen<=this.stringRestriction.maxLength;
    }
}

class VidispineFieldGroup implements VidispineFieldGroupIF {
    name: string;
    schema: Schema;
    field: VidispineFieldIF[];
    origin?: string;
    inheritance?: string;   //while actually a boolean value that is encoded as a string

    constructor(sourceObject: object) {
        VidispineFieldGroupIF.check(sourceObject);
        const sourceGroup = <VidispineFieldGroupIF>sourceObject;

        this.name = sourceGroup.name;
        this.schema = sourceGroup.schema;
        this.field = sourceGroup.field;
        this.origin = sourceGroup.origin;
        this.inheritance = sourceGroup.inheritance;
    }

    getField(fieldname:string):VidispineField | undefined {
        const potentialFields = this.field.filter(f=>f.name===fieldname);
        if(potentialFields.length==0) return undefined;

        return <VidispineField>potentialFields[0];
    }

}
export type {DataPair}; //used by CustomData
export {VidispineField};