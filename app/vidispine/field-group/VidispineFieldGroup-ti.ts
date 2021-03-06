/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const StringRestriction = t.iface([], {
  minLength: t.opt("number"),
  maxLength: t.opt("number"),
});

export const Schema = t.iface([], {
  min: "number",
  max: "number",
  name: "string",
});

export const DataPair = t.iface([], {
  key: "string",
  value: "string",
});

export const VidispineFieldIF = t.iface([], {
  name: "string",
  schema: "Schema",
  type: "string",
  stringRestriction: t.opt("StringRestriction"),
  data: t.opt(t.array("DataPair")),
  defaultValue: t.opt("any"),
  origin: t.opt("string"),
});

export const VidispineFieldGroupIF = t.iface([], {
  name: "string",
  schema: "Schema",
  field: t.array("VidispineFieldIF"),
  origin: t.opt("string"),
  inheritance: t.opt("string"),
});

const exportedTypeSuite: t.ITypeSuite = {
  StringRestriction,
  Schema,
  DataPair,
  VidispineFieldIF,
  VidispineFieldGroupIF,
};
export default exportedTypeSuite;
