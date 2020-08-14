import CustomDataTI from "./CustomData-ti";
import { createCheckers } from "ts-interface-checker";

interface DataPair {
  key: string;
  value: string;
}

interface PlutoCustomData {
  name: string;
  readonly: boolean;
  type: string;
  values?: DataPair[];
}

const { PlutoCustomData } = createCheckers(CustomDataTI);

/**
 * validates the given raw json object as a PlutoCustomData value and returns it.
 * throws an exception if the data fails to validate.
 * @param content raw javascript object parsed from json
 * @return the PlutoCustomData object
 */
function GetPlutoCustomData(content: object): PlutoCustomData {
  PlutoCustomData.check(content);
  return <PlutoCustomData>content;
}

export type { PlutoCustomData };
export { GetPlutoCustomData };
