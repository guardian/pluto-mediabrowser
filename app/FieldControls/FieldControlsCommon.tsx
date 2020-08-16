import { PlutoCustomData } from "../vidispine/field-group/CustomData";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

interface FieldControlProps {
  fieldname: string;
  viewHints: PlutoCustomData;
  maybeValues?: string[];
  controlId: string;
  parentReadonly: boolean;
  valueDidChange: (fieldname: string, newvalues: string[]) => void;
  classes: ClassNameMap<any>;
}

export type { FieldControlProps };
