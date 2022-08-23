import React from "react";
import { FacetCountResponse } from "../vidispine/search/FacetResponse";
import { Grid, IconButton, Paper, Typography } from "@material-ui/core";
import { ArrowRight, ArrowLeft } from "@material-ui/icons";
import PieChartBox from "../PieChartBox";

interface FacetDisplaysProps {
  facets?: FacetCountResponse[];
  isHidden: boolean;
  onHideToggled: (newValue: boolean) => void;
}

const FacetDisplays: React.FC<FacetDisplaysProps> = (props) => {
  return props.isHidden ? (
    <Paper elevation={3}>
      <IconButton aria-label="hide" onClick={() => props.onHideToggled(false)}>
        <ArrowLeft />
      </IconButton>
    </Paper>
  ) : (
    <>
      <Paper elevation={3}>
        <Grid container direction="row" justify="space-between">
          <Grid item sm={1}>
            <IconButton
              aria-label="hide"
              onClick={() => props.onHideToggled(true)}
            >
              <ArrowRight />
            </IconButton>
          </Grid>
          <Grid item sm={10}>
            {props.children}
          </Grid>
        </Grid>
        <Grid container justify="space-around">
          {props.facets && props.facets.length > 0 ? (
            props.facets.map((fct, idx) => (
              <PieChartBox key={idx} chartData={fct} chartName={fct.field} />
            ))
          ) : (
            <Typography variant="caption">No graphs defined</Typography>
          )}
        </Grid>
      </Paper>
    </>
  );
};

export default FacetDisplays;
