import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import StatusFormatter from "./StatusFormatter.jsx";
import TypeFormatter from "./TypeFormatter.jsx";
import PriorityFormatter from "./PriorityFormatter.jsx";
import DateTimeFormatter from "./DateTimeFormatter";

interface JobDataViewProps {
  itemId: string;
  baseURL: string;
}

const JobDataView: React.FC<JobDataViewProps> = (props) => {
  const [vidispineHits, setVidispineHits] = useState<number>(0);
  const [vidispineJobData, setVidispineJobData] = useState<any[]>([]);

  const useStyles = makeStyles((theme) => ({
    tableRow: {
      "&.MuiTableRow-root:hover": {
        cursor: "pointer",
      },
    },
    jobTable: {
      marginTop: "24px",
    },
    jobTableTitle: {
      paddingTop: "10px",
      marginLeft: "18px",
    },
  }));

  const classes = useStyles();

  const getJobData = async (endpoint: string) => {
    try {
      const headers = new Headers();
      const url = props.baseURL + "/API/" + endpoint;
      const result = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + window.localStorage["pluto:access-token"],
        },
      });

      switch (result.status) {
        case 200:
          const incommingVidispineData = await result.json();
          setVidispineHits(incommingVidispineData.hits);
          setVidispineJobData(incommingVidispineData.job);
          return;
        default:
          console.error(
            "Attempt at loading Vidispine job data failed with status: " +
              result.status
          );
      }
    } catch {
      console.error("Attempt at loading Vidispine job data failed.");
    }
  };

  useEffect(() => {
    getJobData("job?jobmetadata=itemId%3d" + props.itemId + "&user=false");
  }, []);

  const detectDarkTheme = () => {
    const isDarkTheme = useTheme().palette.type === "dark";
    return isDarkTheme;
  };

  const colourForStatus = (status: string) => {
    if (detectDarkTheme()) {
      if (status == "FAILED_TOTAL") {
        return "#550000";
      }
      if (status == "FINISHED") {
        return "#004000";
      }
      if (status == "FINISHED_WARNING") {
        return "#424100";
      }
      if (status == "ABORTED") {
        return "#492200";
      }
      return "#222222";
    } else {
      if (status == "FAILED_TOTAL") {
        return "#ffbbbb";
      }
      if (status == "FINISHED") {
        return "#bbffbb";
      }
      if (status == "FINISHED_WARNING") {
        return "#ffffbb";
      }
      if (status == "ABORTED") {
        return "#ffccbb";
      }
      return "#ffffff";
    }
  };

  return (
    <>
      {vidispineHits != 0 ? (
        <Paper elevation={3} className={classes.jobTable}>
          <Typography variant="h3" className={classes.jobTableTitle}>
            Vidispine Jobs
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography>Identity</Typography>
                </TableCell>
                <TableCell>
                  <Typography>User</Typography>
                </TableCell>
                <TableCell>
                  <Typography>Started</Typography>
                </TableCell>
                <TableCell>
                  <Typography>Finished</Typography>
                </TableCell>
                <TableCell>
                  <Typography>Status</Typography>
                </TableCell>
                <TableCell>
                  <Typography>Type</Typography>
                </TableCell>
                <TableCell>
                  <Typography>Priority</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vidispineJobData.map((entry, idx) => {
                return (
                  <TableRow
                    hover
                    onClick={() => {
                      window.open(`/vs-jobs/job/${entry.jobId}`, "_blank");
                    }}
                    key={entry.jobId}
                    className={classes.tableRow}
                    style={{ backgroundColor: colourForStatus(entry.status) }}
                  >
                    <TableCell>
                      <Typography>{entry.jobId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{entry.user}</Typography>
                    </TableCell>
                    <TableCell>
                      {entry.started ? (
                        <DateTimeFormatter value={entry.started} />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {entry.finished ? (
                        <DateTimeFormatter value={entry.finished} />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Typography>
                        <StatusFormatter status={entry.status} />
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        <TypeFormatter type={entry.type} />
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        <PriorityFormatter priority={entry.priority} />
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      ) : null}
    </>
  );
};
export default JobDataView;
