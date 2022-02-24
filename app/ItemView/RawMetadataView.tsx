import React, {
  createRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Grid, IconButton, Paper, Typography } from "@material-ui/core";
import VidispineContext from "../Context/VidispineContext";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import axios from "axios";
import { SystemNotifcationKind, SystemNotification } from "pluto-headers";
// @ts-ignore
import CodeMirror from "codemirror/lib/codemirror"; //see https://github.com/codemirror/CodeMirror/issues/5484
import 'codemirror/lib/codemirror.css';
import "codemirror/theme/material-darker.css";
import "codemirror/mode/xml/xml";
import {metadataStylesHook} from "./MetadataGroupView";
import formatXML from "xml-formatter";

interface RawMetadataViewProps {
  itemId: string;
  elevation: number;
}

const CMTextArea = React.forwardRef<HTMLTextAreaElement, { value: string, visible: boolean }>(
  (props, textAreaRef) => <textarea ref={textAreaRef} value={props.value} style={{display: props.visible ? "inherit" : "none"}}/>
);

const RawMetadataView: React.FC<RawMetadataViewProps> = (props) => {
  const [expanded, setExpanded] = useState(true);
  const [rawMetadataString, setRawMetadataString] = useState("<someRoot><someTag>value</someTag></someRoot>");
  const [updateCounter, setUpdateCounter] = useState(0);

  const vidispineContext = useContext(VidispineContext);
  const classes = metadataStylesHook();

  const loadMetadata = async () => {
    if (vidispineContext) {
      try {
        const response = await axios.get(
          `${vidispineContext.baseUrl}/API/item/${props.itemId}/metadata`,
          { headers: { Accept: "application/xml" } }
        );
        setRawMetadataString(response.data as string);
      } catch (err) {
        console.error("Could not download raw metadata: ", err);
        SystemNotification.open(
          SystemNotifcationKind.Error,
          "Could not download raw metadata, see console for details"
        );
      }
    } else {
      SystemNotification.open(
        SystemNotifcationKind.Error,
        "Unable to get vidispine config, try reloading the page"
      );
    }
  };

  useEffect(() => {
    if (expanded && props.itemId) loadMetadata();
  }, [props.itemId, expanded]);

  useEffect(() => {
    loadMetadata();
  }, [updateCounter]);

  useEffect(()=> {
    loadMetadata();
  }, []);

  const textAreaRef = createRef<HTMLTextAreaElement>();

  useEffect(() => {
    console.log("Initialising Codemirror, ref is ", textAreaRef.current);
    if (!textAreaRef.current) return;

    const codeMirror = CodeMirror.fromTextArea(textAreaRef.current, {
      lineNumbers: true,
      mode: "xml",
      readOnly: true,
      nocursor: true
    });

    codeMirror.setValue(formatXML(rawMetadataString,{
      indentation: '  ',
      lineSeparator: "\n",
      collapseContent: true,
    }));

    return ()=>codeMirror.toTextArea();
  }, [textAreaRef.current, rawMetadataString]);

  return (
    <Paper elevation={props.elevation} className={classes.metagroup}>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item>
          <Typography variant="h3">Raw metadata view</Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <ArrowUpward /> : <ArrowDownward />}
          </IconButton>
        </Grid>
      </Grid>
      <CMTextArea value={rawMetadataString} ref={textAreaRef} visible={true}/>
    </Paper>
  );
};

export default RawMetadataView;
