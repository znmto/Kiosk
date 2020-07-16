import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@material-ui/core";

const Home: React.FC = (props) => {
  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs={12}>
        <Typography variant="h3">
          Please click on My Activity below to get started.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Home;
