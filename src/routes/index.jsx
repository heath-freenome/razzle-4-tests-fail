import React from 'react';

import AppRoutes from './appRoutes';
import serverStylesClientHandler from '../utils/serverStylesClientHandler';

export default function Routes(props) {
  React.useEffect(() => {
    serverStylesClientHandler();
  }, []);
  return <AppRoutes routerProps={props} />;
}
