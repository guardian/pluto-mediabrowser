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
  originalFilename: string | undefined;
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
    // First try to find a shape with video from our default shapes
    for (const defaultTag of props.defaultShapes) {
      const matchingShapes = props.shapes.filter(
        (shape) =>
          shape.tag.includes(defaultTag) &&
          shape.videoComponent &&
          shape.videoComponent.length > 0
      );
      if (matchingShapes.length > 0) {
        console.log(`Found initial shape with tag ${defaultTag}`);
        return defaultTag;
      }
    }

    // If no default shapes with video found, try any shape with video
    const videoShapes = props.shapes.filter(
      (shape) => shape.videoComponent && shape.videoComponent.length > 0
    );
    if (videoShapes.length > 0 && videoShapes[0].tag.length > 0) {
      console.log(`Falling back to shape with tag ${videoShapes[0].tag[0]}`);
      return videoShapes[0].tag[0];
    }

    // Last resort - use the first shape's tag or "original"
    const fallbackTag =
      props.shapes.length > 0 && props.shapes[0].tag.length > 0
        ? props.shapes[0].tag[0]
        : "original";
    console.log(`Falling back to tag ${fallbackTag}`);
    return fallbackTag;
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
    console.log("Processing shape:", {
      id: currentShapeData.id,
      tags: currentShapeData.tag,
      mimeTypes: currentShapeData.mimeType,
      containerComponent: currentShapeData.containerComponent?.file?.map(
        (f) => ({
          id: f.id,
          uri: f.uri,
        })
      ),
      audioComponent: currentShapeData.audioComponent?.map((c) => ({
        id: c.id,
        files: c.file.map((f) => ({ id: f.id, uri: f.uri })),
      })),
      videoComponent: currentShapeData.videoComponent?.map((c) => ({
        id: c.id,
        files: c.file.map((f) => ({ id: f.id, uri: f.uri })),
      })),
    });

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
    console.log("Shape selection changed to:", selectedShapeTag);
    const currentShapeData = findSelectedShape();
    console.log("Selected shape:", currentShapeData);

    if (!currentShapeData) {
      console.warn("No suitable shape found");
      return;
    }

    const fileId = getFileId(currentShapeData);
    if (!fileId) {
      console.warn("No file ID found in shape", currentShapeData);
      return;
    }

    // Find the matching URI from the uriList
    const matchingUri = props.uriList.find((uri) => uri.includes(fileId));
    console.log("Matching URI:", matchingUri);
    if (matchingUri) {
      console.log("Found matching URI:", matchingUri);
      setPlayerUri(matchingUri);
      setTargetUrl(matchingUri);
    } else {
      console.warn("No matching URI found for file ID", fileId);
      setPlayerUri("");
      setTargetUrl("");
    }
  }, [selectedShapeTag, props.shapes, props.uriList]);

  useEffect(() => {
    let baseUri = playerUri.replace(":8080", "");
    if (props.originalFilename === undefined) {
      setTargetUrl(baseUri);
    } else {
      let baseUrl = baseUri.slice(0, baseUri.lastIndexOf("/") + 1);
      let newTargetUrl = baseUrl + props.originalFilename;
      setTargetUrl(newTargetUrl);
    }
  }, [playerUri, props.originalFilename]);

  /**
   * returns the VidispineShape data structure associated with the shape matching the selected tag
   */
  const findSelectedShape = (): VidispineShape | undefined => {
    // First try to find a shape with the selected tag that has video
    const videoShapes = props.shapes.filter(
      (shape) =>
        shape.tag.includes(selectedShapeTag) &&
        shape.videoComponent &&
        shape.videoComponent.length > 0
    );

    if (videoShapes.length > 0) return videoShapes[0];

    // If no video shapes found, try any shape with the selected tag
    const anyShapes = props.shapes.filter((shape) =>
      shape.tag.includes(selectedShapeTag)
    );

    if (anyShapes.length > 0) return anyShapes[0];

    // If still nothing found, try the first shape with video
    const anyVideoShapes = props.shapes.filter(
      (shape) => shape.videoComponent && shape.videoComponent.length > 0
    );

    if (anyVideoShapes.length > 0) return anyVideoShapes[0];

    // Last resort - just return the first shape
    return props.shapes.length > 0 ? props.shapes[0] : undefined;
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
