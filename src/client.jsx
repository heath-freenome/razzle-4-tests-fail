import React from 'react';
import { hydrate } from 'react-dom';

import Routes from './routes';

/** Hydrate the Routes as the application using the populated store
 */
hydrate(<Routes />, document.getElementById('react-root'));

/** Enable hot module replacement for the client app
 */
if (module.hot) {
  module.hot.accept();
}
