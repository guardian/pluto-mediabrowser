import React, {
  createRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Grid, IconButton, Paper, Typography } from "@material-ui/core";
import VidispineContext from "../Context/VidispineContext";
import {ArrowDownward, ArrowUpward, Drafts} from "@material-ui/icons";
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

interface RawMetadataViewProps {
  itemId: string;
  elevation: number;
}

const CMTextArea = React.forwardRef<
  HTMLTextAreaElement,
  { value: string; visible: boolean }
>((props, textAreaRef) => (
  <textarea
    ref={textAreaRef}
    value={props.value}
    style={{ display: props.visible ? "inherit" : "none" }}
  />
));

/* styling and drag-handle from https://jsfiddle.net/mindplay/rs2L2vtb/2/ */
const dragHandleStyles = makeStyles((theme) => ({
  dragHandle: {
    background: theme.palette.grey.A400,
    height: "20px",
    userSelect: "none",
    cursor: "row-resize",
    borderTop: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
    "&:before": {
      content: "\\2261", /* https://en.wikipedia.org/wiki/Triple_bar */
      color: "#999",
      position: "absolute",
      left: "50%"
    },
    "&:hover": {
      background: theme.palette.grey.A700
    }
  },
}));

const CMDragHandle = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
  const classes = dragHandleStyles();
  return <div className={classes.dragHandle} ref={ref} />;
});

const RawMetadataView: React.FC<RawMetadataViewProps> = (props) => {
  const [expanded, setExpanded] = useState(true);
  const [rawMetadataString, setRawMetadataString] = useState(
    "<!-- XML content will be shown here -->"
  );
  const [updateCounter, setUpdateCounter] = useState(0);
  const [codeMirror, setCodeMirror] = useState<CodeMirror|undefined>(undefined);
  const [startX, setStartX] = useState(-1);
  const [startY, setStartY] = useState(-1);
  const [startH, setStartH] = useState(-1);

  const CM_MIN_HEIGHT = 200;  //minimum height of the codemirror view, in px.

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

  useEffect(() => {
    loadMetadata();
  }, []);

  const textAreaRef = createRef<HTMLTextAreaElement>();
  const dragHandleRef = createRef<HTMLDivElement>();

  useEffect(() => {
    console.log("Initialising Codemirror, ref is ", textAreaRef.current);
    if (!textAreaRef.current) return;

    const codeMirror = CodeMirror.fromTextArea(textAreaRef.current, {
      lineNumbers: true,
      mode: "xml",
      readOnly: true,
      nocursor: true,
    });

    try {
      codeMirror.setValue(
          formatXML(rawMetadataString, {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          })
      );
    } catch(err) {
      codeMirror.setValue(`<!-- XML metadata failed to parse: ${err.toString()} -->`)
    }
    setCodeMirror(codeMirror);

    return () => {
      console.log("removing codemirror");
      codeMirror.toTextArea();
      setCodeMirror(undefined);
    }
  }, [textAreaRef.current, rawMetadataString]);

  /**
   * This callback is only used temporarily. It is inserted by `startDraggingHandler` and removed by `onDragRelease`,
   * so it is only active while the user has a mouse button down over the drag handle.
   * It continuously changes the height of the codemirror instance according to the relative movement of the mouse
   * @param evt MouseEvent provided by the DOM
   */
  const onDragHandler = (evt:MouseEvent) => {
    if(codeMirror) {
      const desiredHeight =  Math.max(CM_MIN_HEIGHT, (startH + evt.y - startY));
      codeMirror.setSize(null, `${desiredHeight}px`);
    } else {
      console.error("codeMirror not set in state so can't change it");
    }
  }

  const onDragRelease = (evt:MouseEvent) => {
    console.log("drag end");
    document.body.removeEventListener("mousemove", onDragHandler);
    window.removeEventListener("mouseup", onDragRelease);
  }

  /**
   * This callback is run when the user pushes a mouse button over the drag handle.
   * We store the co-ords of the start of the drag in order to compute how much to increase/reduce the size by
   * We also register handlers to detect movement within the document, in order to update the size continuously,
   * and another to detect mouse-up anywhere in the window to stop the operation.
   * @param evt MouseEvent provided by the DOM
   */
  const startDraggingHandler = (evt:MouseEvent)=> {
    if (codeMirror) {
      console.log("drag start");
      setStartX(evt.x);
      setStartY(evt.y);
      setStartH(codeMirror.getSize());
      document.body.addEventListener("mousemove", onDragHandler);
      window.addEventListener("mouseup", onDragRelease);
    } else {
      console.log("CodeMirror not set in state, so can't resize it");
    }
  }

  //set up the drag handle
  useEffect(()=>{
    if(dragHandleRef.current) {
      dragHandleRef.current.addEventListener("mousedown", startDraggingHandler);

      return ()=>dragHandleRef.current?.removeEventListener("mousedown", startDraggingHandler);
    }
  }, [dragHandleRef.current]);

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
      <CMTextArea value={rawMetadataString} ref={textAreaRef} visible={true} />
      <CMDragHandle ref={dragHandleRef}/>
    </Paper>
  );
};

export default RawMetadataView;
