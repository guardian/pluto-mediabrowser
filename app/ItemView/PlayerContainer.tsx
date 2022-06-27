import React, { useState, useEffect } from "react";
import { VidispineShape } from "../vidispine/shape/VidispineShape";
import {
  Grid,
  Typography,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  makeStyles,
} from "@material-ui/core";
import PreviewPlayer from "./PreviewPlayer";
import ShapeSelector from "./ShapeSelector";
import axios from "axios";
import HelpIcon from "@material-ui/icons/Help";

interface PlayerContainerProps {
  shapes: VidispineShape[];
  uriList: string[];
  defaultShapes: string[];
}

const useStyles = makeStyles({
  infoIcon: {
    display: "flex",
    marginLeft: "auto",
    marginBottom: "0.625rem",
  },
});

const PlayerContainer: React.FC<PlayerContainerProps> = (props) => {
  const classes = useStyles();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  /**
   * checks to see if any of the shapes we have been given have tags that match the ones that are our "defaults".
   * if so, return the first matching tag. this is used as the default value for the shapetag selector.
   */
  const findInitialShapetag = () => {
    const shapeMatches = props.shapes
      .filter((shape) => shape.tag.length > 0)
      .filter((shape) => props.defaultShapes.includes(shape.tag[0]));
    return shapeMatches.length > 0 ? shapeMatches[0].tag[0] : "";
  };

  const [selectedShapeTag, setSelectedShapeTag] = useState<string>(
    findInitialShapetag()
  );
  //const [selectedShape, setSelectedShape] = useState<VidispineShape|null>(null);
  const [playerUri, setPlayerUri] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");

  /**
   * try to locate the file ID associated with the given shape
   * @param currentShapeData
   */
  const getFileId = (currentShapeData: VidispineShape) => {
    if (currentShapeData.mimeType.length > 0) {
      setMimeType(currentShapeData.mimeType[0]);
    }
    if (currentShapeData.containerComponent) {
      return currentShapeData.containerComponent.file &&
        currentShapeData.containerComponent.file.length > 0
        ? currentShapeData.containerComponent.file[0].id
        : undefined;
    }
    if (currentShapeData.audioComponent) {
      const potentialComponents = currentShapeData.audioComponent.filter(
        (c) => c.file.length > 0
      );
      if (potentialComponents.length > 0) {
        return potentialComponents[0].file[0].id;
      } else {
        return undefined;
      }
    }
    if (currentShapeData.videoComponent) {
      const potentialComponents = currentShapeData.videoComponent.filter(
        (c) => c.file.length > 0
      );
      if (potentialComponents.length > 0) {
        return potentialComponents[0].file[0].id;
      } else {
        return undefined;
      }
    }
    if (currentShapeData.binaryComponent) {
      const potentialComponents = currentShapeData.binaryComponent.filter(
        (c) => c.file.length > 0
      );
      if (potentialComponents.length > 0) {
        return potentialComponents[0].file[0].id;
      } else {
        return undefined;
      }
    }
    return undefined;
  };

  /**
   * when the selected shape tag changes, update the player url
   */
  useEffect(() => {
    const currentShapeData = findSelectedShape();
    if (!currentShapeData) return;

    const fileId = getFileId(currentShapeData);
    if (!fileId) return;

    console.log("fileId is ", fileId);

    const matcher = new RegExp(`${fileId}\..*$`);
    //uri.search returns the index in the string of a match, or -1 if there is no match
    const matchingUris = props.uriList.filter((uri) => uri.search(matcher) > 0);
    console.log(matchingUris);
    console.debug(`Found ${matchingUris.length} matching URIs`);

    if (matchingUris.length > 0) {
      setPlayerUri(matchingUris[0]);
    } else {
      setPlayerUri("");
    }
  }, [selectedShapeTag]);

  useEffect(() => {
    setTargetUrl(`${playerUri.replace(":8080", "")}`);
  }, [playerUri]);

  /**
   * returns the VidispineShape data structure associated with the shape matching the selected tag
   */
  const findSelectedShape = () => {
    if (selectedShapeTag === "") return null;
    for (let i = 0; i < props.shapes.length; ++i) {
      if (props.shapes[i].tag.includes(selectedShapeTag))
        return props.shapes[i];
    }
    return null;
  };

  const closeDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Grid container alignItems="center" justify="center" direction="column">
        <Grid item xs={12} spacing={1}>
          {<PreviewPlayer proxyUri={playerUri} mediaType={mimeType} />}
          {selectedShapeTag == "" ? (
            <Typography variant="caption">
              There is no shape currently selected
            </Typography>
          ) : null}
          {selectedShapeTag != "" && !playerUri ? (
            <Typography variant="caption">
              Could not find a uri for {mimeType}
            </Typography>
          ) : null}
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <ShapeSelector
                options={props.shapes.map((s) =>
                  s.tag.length > 0 ? s.tag[0] : ""
                )}
                onSelectionChanged={(newSelection) =>
                  setSelectedShapeTag(newSelection)
                }
                currentTag={selectedShapeTag}
              />
            </Grid>
            <Grid item xs={4}>
              {playerUri != "" ? (
                <div style={{ marginTop: "8px" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    target="_blank"
                    href={targetUrl}
                  >
                    Download
                  </Button>
                </div>
              ) : null}
            </Grid>
            <Grid item xs={4}>
              {playerUri != "" ? (
                <Tooltip
                  className={classes.infoIcon}
                  title="How do I download files?"
                >
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenDialog(true);
                    }}
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Select the file you want to download from the menu. To select the
            original file, select 'Original'.
            <br />
            <br />
            To save the file locally on Chrome and Firefox right click on the
            DOWNLOAD button and select 'Save Link As...'.
            <br />
            <br />
            To save the file locally on Safari right click on the DOWNLOAD
            button and select 'Download Linked File As...'.
            <br />
            <br />
            If right clicking does not work on your computer do the following: -
            <br />
            <br />
            1. Open System Preferences.
            <br />
            2. Click on Mouse.
            <br />
            3. In the right hand menu select 'Secondary Button'.
            <br />
            4. Close System Preferences.
            <br />
            <br />
            Right clicking should now work.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlayerContainer;
