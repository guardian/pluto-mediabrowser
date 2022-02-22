import React, { useContext, useEffect, useState } from "react";
import { VidispineFieldGroup } from "../vidispine/field-group/VidispineFieldGroup";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import {
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { metadataStylesHook } from "./MetadataGroupView";
// @ts-ignore
import atomIcon from "../static/atom_icon.svg";
import MediaAtomToolContext from "../pluto-deliverables/MediaAtomToolContext";
import { SystemNotifcationKind, SystemNotification } from "pluto-headers";
import {DynamicFeed} from "@material-ui/icons";

interface MetadataDeliverableViewProps {
  group: VidispineFieldGroup;
  content: VidispineItem;
  elevation: number;
}

const MetadataDeliverableView: React.FC<MetadataDeliverableViewProps> = (
  props
) => {
  const [maybeAtomId, setMaybeAtomId] = useState<string | undefined>(undefined);
  const [maybeDeliverableBundle, setMaybeDeliverableBundle] = useState<
    number | undefined
  >(undefined);
  const classes = metadataStylesHook();

  const mediaAtomContext = useContext(MediaAtomToolContext);

  useEffect(() => {
    const results = props.content.getMetadataValuesInGroup(
      "gnm_atom_id",
      "Deliverable"
    );
    if (results) {
      results.length > 0
        ? setMaybeAtomId(results[0])
        : setMaybeAtomId(undefined);
    } else {
      setMaybeAtomId(undefined);
    }
  }, [props.content]);

  useEffect(() => {
    const results = props.content.getMetadataValuesInGroup(
      "gnm_deliverable_bundle",
      "Deliverable"
    );
    try {
      const numericBundleId =
        results && results.length > 0 ? parseInt(results[0]) : undefined;
      setMaybeDeliverableBundle(numericBundleId);
    } catch (err) {
      console.error(
        "The returned metadata ",
        results,
        " did not contain a valid bundle ID. Error was ",
        err
      );
      setMaybeDeliverableBundle(undefined);
    }
  }, [props.content]);

  const jumpToAtom = () => {
    if (mediaAtomContext && maybeAtomId) {
      const url = `${mediaAtomContext.baseUrl}/videos/${maybeAtomId}`;
      window.open(url, "_blank", "noopener");
    } else {
      console.error(
        `Can't open media atom tool, probably because media atom base url '${mediaAtomContext?.baseUrl}' is undefined. Atom ID to open was '${maybeAtomId}`
      );
      SystemNotification.open(
        SystemNotifcationKind.Error,
        "Can't open media atom tool, please check the config"
      );
    }
  };

  const jumpToBundle = () => {
      const url = `/deliverables/project/${maybeDeliverableBundle}`;
      window.open(url);
  }

  return (
    <Paper elevation={props.elevation} className={classes.metagroup}>
      <Typography variant="h3">Deliverable</Typography>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={2}
      >

      </Grid>
      <Grid container direction="row" justify="flex-start" spacing={3}>
        <Grid item>
          <Tooltip
            title={
              maybeAtomId
                ? "Open the media atom for this video in a new tab"
                : "This video did not come from a media atom"
            }
          >
            <span>
              <IconButton onClick={jumpToAtom} disabled={!maybeAtomId}>
                <img
                  src={atomIcon}
                  alt="atom"
                  style={{ width: "26px", height: "26px" }}
                  className={
                    maybeAtomId ? classes.enabledIcon : classes.disabledIcon
                  }
                />
              </IconButton>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
            <Tooltip title="See other versions of this deliverable">
                <span>
                    <IconButton onClick={jumpToBundle} disabled={!maybeDeliverableBundle}>
                        <DynamicFeed/>
                    </IconButton>
                </span>
            </Tooltip>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MetadataDeliverableView;
