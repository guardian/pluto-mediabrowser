import { PlutoCustomData } from "../vidispine/field-group/CustomData";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

/**
 * this interface describes the base properties that all of the FieldControls expect
 */
interface FieldControlProps {
  fieldname: string;
  viewHints: PlutoCustomData;
  maybeValues?: string[];
  controlId: string;
  parentReadonly: boolean;
  ignoreHintsReadonly: boolean;
  valueDidChange: (fieldname: string, newvalues: string[]) => void;
  classes: ClassNameMap<any>;
}

export type { FieldControlProps };
