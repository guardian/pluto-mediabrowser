import React, {
  createRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Grid, IconButton, Paper, Typography } from "@material-ui/core";
import VidispineContext from "../Context/VidispineContext";
import { ArrowDownward, ArrowUpward, Drafts, Replay } from "@material-ui/icons";
import axios from "axios";
import { SystemNotifcationKind, SystemNotification } from "pluto-headers";
// @ts-ignore
import CodeMirror from "codemirror/lib/codemirror"; //see https://github.com/codemirror/CodeMirror/issues/5484
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-darker.css";
import "codemirror/mode/xml/xml";
import { metadataStylesHook } from "./MetadataGroupView";
import formatXML from "xml-formatter";
import { makeStyles } from "@material-ui/core/styles";
import CodeMirrorContainer from "./CodeMirrorContainer";

interface RawMetadataViewProps {
  itemId: string;
  elevation: number;
}

const RawMetadataView: React.FC<RawMetadataViewProps> = (props) => {
  const [rawMetadataString, setRawMetadataString] = useState(
    "<!-- XML content will be shown here -->"
  );
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
    loadMetadata();
  }, [updateCounter]);

  return (
    <Paper elevation={props.elevation} className={classes.metagroup}>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item>
          <Typography variant="h3">Raw metadata view</Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setUpdateCounter((prev) => prev + 1)}>
            <Replay />
          </IconButton>
        </Grid>
      </Grid>
      <CodeMirrorContainer value={rawMetadataString} />
    </Paper>
  );
};

export default RawMetadataView;
