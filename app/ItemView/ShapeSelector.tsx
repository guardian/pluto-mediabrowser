import React from "react";
import {FormControl, InputLabel, Select, MenuItem} from "@material-ui/core";

interface ShapeSelectorProps {
    options: string[];
    onSelectionChanged: (newValue:string)=>void;
    currentTag: string;
}

const ShapeSelector:React.FC<ShapeSelectorProps> = (props) => {
    return (
        <FormControl>
            <InputLabel htmlFor="shape-tag-selector">Showing:</InputLabel>
            <Select id="shape-tag-selector" value={props.currentTag}
                    onChange={(evt)=>props.onSelectionChanged(evt.target.value as string)}>
                {
                    props.options.map((tag, idx)=><MenuItem key={idx} value={tag}>{tag}</MenuItem>)
                }
            </Select>
        </FormControl>
    )
}

export default ShapeSelector;