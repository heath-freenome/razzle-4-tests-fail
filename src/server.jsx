import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheets } from '@material-ui/core/styles';

import Routes from './routes';
import { SERVER_STYLES_ID } from './utils/serverStylesClientHandler';

const server = express();

server
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', async (req, res) => {
    const context = {};
    const sheets = new ServerStyleSheets();

    const markup = renderToString(sheets.collect(<Routes context={context} location={req.url} />));
    if (context.url) {
      res.redirect(context.url);
    } else {
      const cssString = sheets.toString();
      const html = `<!doctype html>
        <html lang="en">
        <head>
            <style id="${SERVER_STYLES_ID}">${cssString}</style>
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" charset="UTF-8" content="width=device-width, initial-scale=1.0">
            <title>Test</title>
        </head>
        <body>
            <div id="react-root">${markup}</div>
        </body>
      </html>`;
      res.status(200).send(html);
    }
  });

export default server;
