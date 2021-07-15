import React from 'react';
import { Grid, Typography } from '@material-ui/core';

export default function Home() {
  return (
    <Grid item sm={12}>
      <Typography variant="h2" gutterBottom>
        Hello World
      </Typography>
    </Grid>
  );
}
