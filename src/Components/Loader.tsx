import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTheme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      "& > * + *": {
        marginLeft: theme.spacing(2),
      },
    },
  })
);

export default (_) => {
  const theme: Theme = useTheme();
  const classes = useStyles(theme);
  return (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  );
};
