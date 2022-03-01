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
import { parseISO } from "date-fns";
import { format } from "date-fns";
import { metadataStylesHook } from "./MetadataGroupView";
// @ts-ignore
import atomIcon from "../static/atom_icon.svg";
import MediaAtomToolContext from "../pluto-deliverables/MediaAtomToolContext";
import {
  Breadcrumb,
  SystemNotifcationKind,
  SystemNotification,
} from "pluto-headers";
import { DynamicFeed } from "@material-ui/icons";
import { DenormalisedDeliverable } from "../pluto-deliverables/DeliverablesTypes";
import { GetDeliverableById } from "../pluto-deliverables/DeliverablesService";
import { Alert } from "@material-ui/lab";

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
  const [maybeDeliverableId, setMaybeDeliverableId] = useState<
    number | undefined
  >(undefined);
  const [maybeDeliverableInfo, setMaybeDeliverableInfo] = useState<
    DenormalisedDeliverable | undefined
  >(undefined);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    const results = props.content.getMetadataValuesInGroup(
      "gnm_deliverable_id",
      "Deliverable"
    );
    try {
      const numericBundleId =
        results && results.length > 0 ? parseInt(results[0]) : undefined;
      setMaybeDeliverableId(numericBundleId);
    } catch (err) {
      console.error(
        "The returned metadata ",
        results,
        " did not contain a valid deliverable ID. Error was ",
        err
      );
      setMaybeDeliverableId(undefined);
    }
  }, [props.content]);

  /**
   * Load in deliverable bundle information (if possible) when the deliverable bundle number changes
   */
  useEffect(() => {
    if (maybeDeliverableId) {
      GetDeliverableById(maybeDeliverableId)
        .then((deliv) => setMaybeDeliverableInfo(deliv))
        .catch((err) => {
          setMaybeDeliverableInfo(undefined);
          setLoadError("Could not load deliverable information at this time");
        });
    }
  }, [maybeDeliverableId]);

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
  };

  /**
   * Takes in an ISO timestamp as a string and reformats it with date-fns
   * @param ts
   */
  const friendlyTimestamp = (ts: string) => {
    try {
      const parsedDT = parseISO(ts);
      return format(parsedDT, "HH:mm, eee do MMM yyyy");
    } catch (err) {
      console.error(`Could not format timestamp ${ts}: `, err);
      return "invalid date";
    }
  };

  return (
    <Paper elevation={props.elevation} className={classes.metagroup}>
      <Typography variant="h3" style={{marginBottom: "0.6em"}}>Deliverable</Typography>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={2}
        style={{paddingLeft:"0.4em", paddingRight: "0.4em"}}
      >
        <>
          {loadError ? (
            <Grid item>
              <Alert severity="error">{loadError}</Alert>
            </Grid>
          ) : undefined}

          {maybeDeliverableInfo ? (
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <Breadcrumb
                  commissionId={maybeDeliverableInfo.deliverable?.commission_id}
                  projectId={
                    maybeDeliverableInfo.deliverable?.pluto_core_project_id
                  }
                  masterId={maybeDeliverableInfo.id}
                />
              </Grid>
              <Grid item>
                <Typography>
                  This is a {maybeDeliverableInfo.version}{" "}
                  {maybeDeliverableInfo.type_string} in the bundle &quot;
                  {maybeDeliverableInfo.deliverable?.name}&quot;
                </Typography>
              </Grid>
              <Grid item>
                <Typography>
                  Current status: {maybeDeliverableInfo.status_string}
                </Typography>
              </Grid>
              <Grid item>
                <Typography>
                  Last modified at{" "}
                  {friendlyTimestamp(maybeDeliverableInfo.modified_dt)}
                </Typography>
              </Grid>
            </Grid>
          ) : undefined}
        </>
      </Grid>
      <hr style={{marginTop: "1em"}}/>
      <Grid container direction="row" justify="flex-start" spacing={1}>
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
              <IconButton
                  onClick={jumpToBundle}
                  disabled={!maybeDeliverableBundle}
              >
                <DynamicFeed />
              </IconButton>
            </span>
          </Tooltip>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MetadataDeliverableView;
