/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const VidispineFile = t.iface([], {
  "id": "string",
  "path": "string",
  "uri": t.array("string"),
  "state": "string",
  "size": "number",
  "hash": "string",
  "timestamp": t.opt("string"),
  "refreshFlag": t.opt("number"),
  "storage": "string",
  "metadata": "any",
});

const exportedTypeSuite: t.ITypeSuite = {
  VidispineFile,
};
export default exportedTypeSuite;
