/* eslint-disable no-console */
import express from 'express';

/** Get the app from the `server.jsx` file into a variable that can be
 * overridden by a hot reload
 *
 * @type {e.Express}
 */
let app = require('./server').default;

/** Enable hot module replacement for the server.jsx file
 */
if (module.hot) {
  module.hot.accept('./server', () => {
    console.log('🔁  HMR Reloading `./server`...');
    try {
      // Replace the app as a result of the hot reload
      app = require('./server').default; // eslint-disable-line global-require
    } catch (error) {
      console.error(error);
    }
  });
  console.info('✅  Server-side HMR Enabled!');
}

/** Use the port from the PORT environment variable, defaulting to 8000
 * @type {string|number}
 */
const port = process.env.PORT || 3000;

/** All the code was adapted from the OOTB `index.jsx` file that is output when
 * creating a new [razzle](https://razzlejs.org/getting-started) via the
 * `npx create-razzle-app` command. Only the default port was updated to be 3000.
 *
 * Basically we create an express server that passes an inbound request to the
 * server application's `handle` function, while it listens on the specified
 * port.
 */
export default express()
  .use((req, res) => app.handle(req, res))
  .listen(port, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`> Started on port ${port}`);
  });
