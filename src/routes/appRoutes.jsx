import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Switch, Route } from 'react-router';
import { BrowserRouter, StaticRouter } from 'react-router-dom';

import isBrowser from '../utils/isBrowser';
import Home from './home/home';

export default function AppRoutes({ routerProps }) {
  const Router = isBrowser() ? BrowserRouter : StaticRouter;
  return (
    <Router {...routerProps}>
      <Switch>
        <Route exact path="/home" component={Home} />
        <Redirect to="/home" />
      </Switch>
    </Router>
  );
}

AppRoutes.propTypes = {
  routerProps: PropTypes.shape({}).isRequired,
};
