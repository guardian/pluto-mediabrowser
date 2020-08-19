/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const DataPair = t.iface([], {
  key: "string",
  value: "string",
});

export const PlutoCustomData = t.iface([], {
  name: "string",
  readonly: "boolean",
  type: "string",
  values: t.opt(t.array("DataPair")),
});

const exportedTypeSuite: t.ITypeSuite = {
  DataPair,
  PlutoCustomData,
};
export default exportedTypeSuite;
