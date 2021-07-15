import isBrowser from './isBrowser';

export const SERVER_STYLES_ID = 'material-ui-styles';

/** Handler function that will look for any server generated styles on the client and remove them. This pattern is
 * recommended by the `@material-ui` [server rendering documentation](https://material-ui.com/guides/server-rendering/).
 */
export default function serverStylesClientHandler() {
  if (isBrowser()) {
    const jssStyles = document.querySelector(`#${SERVER_STYLES_ID}`);
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }
}
