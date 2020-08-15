import React from "react";
import {FieldControlProps} from "./FieldControlsCommon";
import {FormControl, FormLabel, Input, TextField, Typography} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

const LookupField:React.FC<FieldControlProps> = (props) => {
    return (
        <FormControl classes={{ root: props.classes.inputField }}>
            <FormLabel htmlFor={props.controlId}>{props.viewHints.name}</FormLabel>
            {props.viewHints.readonly || props.parentReadonly ? (
                <Input
                    readOnly={true}
                    id={props.controlId}
                    value={props.maybeValues ? props.maybeValues.join(" ") : ""}
                />
            ) : (
                <Autocomplete
                    renderInput={(params) => <TextField {...params} />}
                    options={props.viewHints.values ?? []}
                    getOptionLabel={(entry) => entry.value}
                />
            )}
            {props.viewHints.readonly && !props.parentReadonly ? (
                <Typography variant="caption">
                    You can't edit this, it's read-only
                </Typography>
            ) : null}
        </FormControl>
    )
}

export default LookupField;