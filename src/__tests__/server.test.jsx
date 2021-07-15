import { shallow } from 'enzyme';
import { ServerStyleSheets } from '@material-ui/core/styles';
import is from 'is_js';

import { SERVER_STYLES_ID } from '../utils/serverStylesClientHandler';

function isPromise(maybePromise) {
  if (is.not.object(maybePromise)) {
    return false;
  }
  if (Promise.resolve(maybePromise) === maybePromise) {
    return true;
  }
}

const REDIRECT_URL = '/redirector';
const NORMAL_URL = '/home';
const REDIRECT_REQUEST = {
  url: REDIRECT_URL,
};
const NORMAL_REQUEST = {
  url: NORMAL_URL,
};
const MOCK_STYLER_KEY = 'styler';
const FAKE_MARKUP = '<div>fake app</div>';

/** Mock the renderToString function to shallow render the component using enzyme, then returning null if the wrapper
 * is an empty render, otherwise, return wrapper.text()
 */
const mockRenderToString = jest.fn((component) => {
  const wrapper = shallow(component);
  if (wrapper.isEmptyRender()) {
    return null;
  }
  return wrapper.text();
});
jest.mock('react-dom/server', () => ({
  ...jest.requireActual('react-dom/server'),
  renderToString: mockRenderToString,
}));

/** Mock express to track calls to express.static, the creation of the server instance, and the execution of the parts
 * of the server instance, including capturing the server's get callback function
 */
const mockGetCallbacks = [];
let mockServerInstance;
const mockExpress = jest.fn(() => {
  mockServerInstance = {};
  mockServerInstance.use = jest.fn().mockReturnValue(mockServerInstance);
  mockServerInstance.get = jest.fn((_, callback) => {
    mockGetCallbacks.push(callback);
    return mockServerInstance;
  });
  return mockServerInstance;
});
jest.mock('express', () => mockExpress);
mockExpress.static = jest.fn((val) => val);

const mockRenderServerStylesTagValue = '<script>.Foo:{display:"none"}</script>';
const mockSsrStylesCollectors = [];
jest.mock('@material-ui/core/styles', () => ({
  ...jest.requireActual('@material-ui/core/styles'),
  ServerStyleSheets: jest.fn(() => {
    const collector = {
      collect: jest.fn((component) => {
        // Mark the component has having been run through the styler by updating the context prop
        component.props.context[MOCK_STYLER_KEY] = mockSsrStylesCollectors.length; // eslint-disable-line no-param-reassign
        return component;
      }),
      toString: jest.fn().mockReturnValue(mockRenderServerStylesTagValue),
    };
    mockSsrStylesCollectors.push(collector);
    return collector;
  }),
}));

/** Mock the Routes component to be able to collect the props and deal with redirect vs normal render (which returns
 * the FAKE_MARKUP)
 */
const mockRoutesProps = [];
const mockRoutesComponent = ({ location, context }) => {
  mockRoutesProps.push({ location, context });
  if (location === REDIRECT_URL) {
    context.url = NORMAL_URL;
    return null;
  }
  return FAKE_MARKUP;
};
jest.mock('../routes', () => mockRoutesComponent);

const EXPECTED_HTML = `<!doctype html>
        <html lang="en">
        <head>
            <style id="${SERVER_STYLES_ID}">${mockRenderServerStylesTagValue}</style>
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" charset="UTF-8" content="width=device-width, initial-scale=1.0">
            <title>Test</title>
        </head>
        <body>
            <div id="react-root">${FAKE_MARKUP}</div>
        </body>
      </html>`;

describe('server.jsx', () => {
  let renderIndex;
  function checkMockForMockRouteComponentCall(mocker, contextKey, callIndex = 0) {
    const props = mockRoutesProps[renderIndex];
    const call = mocker.mock.calls[callIndex][0];
    expect(mocker).toHaveBeenCalledTimes(callIndex + 1);
    expect(call.type).toBe(mockRoutesComponent);
    expect(call.props).toEqual(props);
    if (contextKey) {
      // If provided check to see if the context was decorated with the given key
      expect(call.props.context[contextKey]).toEqual(renderIndex + 1);
    }
  }
  beforeAll(() => {
    // Add the necessary razzle environment variables
    process.env.RAZZLE_PUBLIC_DIR = 'razzle-public-dir';
    require('../server');
  });
  afterAll(() => {
    delete process.env.RAZZLE_PUBLIC_DIR;
  });
  it('express.static() was called with RAZZLE_PUBLIC_DIR', () => {
    expect(mockExpress.static).toHaveBeenCalledWith(process.env.RAZZLE_PUBLIC_DIR);
  });
  it('server.use() was called with passed through RAZZLE_PUBLIC_DIR', () => {
    expect(mockServerInstance.use).toHaveBeenCalledWith(process.env.RAZZLE_PUBLIC_DIR);
  });
  describe('server.get("/*")', () => {
    let callback;
    beforeAll(() => {
      callback = mockGetCallbacks[0];
    });
    it('server.get() was called with path and a callback function', () => {
      expect(mockServerInstance.get).toHaveBeenNthCalledWith(1, '/*', callback);
    });
    describe('hit callback function with redirect location', () => {
      let req;
      let res;
      let callbackPromise;
      beforeAll(() => {
        renderIndex = 0;
        req = REDIRECT_REQUEST;
        res = { redirect: jest.fn() };
        callbackPromise = callback(req, res);
        return callbackPromise;
      });
      it('callback result is a promise', () => {
        expect(isPromise(callbackPromise)).toBe(true);
      });
      it('ServerStyleSheets was called', () => {
        expect(ServerStyleSheets).toHaveBeenCalled();
      });
      it('current ServerStyleSheets.collect was called with Routes component, marking it', () => {
        checkMockForMockRouteComponentCall(mockSsrStylesCollectors[renderIndex].collect, MOCK_STYLER_KEY);
      });
      it('renderToString was called with the Routes component, no extra marks ', () => {
        checkMockForMockRouteComponentCall(mockRenderToString, undefined, renderIndex);
      });
      it('current ServerStylesCollector.renderServerStylesTag was not called', () => {
        expect(mockSsrStylesCollectors[renderIndex].toString).not.toHaveBeenCalled();
      });
      it('response.redirect was called with the context.url', () => {
        const props = mockRoutesProps[renderIndex];
        expect(res.redirect).toHaveBeenCalledWith(props.context.url);
      });
    });
    describe('hit callback function with normal location', () => {
      let req;
      let res;
      let callbackPromise;
      beforeAll(() => {
        renderIndex = 1;
        req = NORMAL_REQUEST;
        res = {
          status: jest.fn(() => res),
          send: jest.fn(),
        };
        callbackPromise = callback(req, res);
        return callbackPromise;
      });
      it('callback result is a promise', () => {
        expect(isPromise(callbackPromise)).toBe(true);
      });
      it('ServerStyleSheets was called', () => {
        expect(ServerStyleSheets).toHaveBeenCalledTimes(2);
      });
      it('current ServerStylesCollector.collect was called with Routes component, marking it', () => {
        checkMockForMockRouteComponentCall(mockSsrStylesCollectors[renderIndex].collect, MOCK_STYLER_KEY);
      });
      it('renderToString was called with the Routes component, no extra marks', () => {
        checkMockForMockRouteComponentCall(mockRenderToString, undefined, renderIndex);
      });
      it('current ServerStylesCollector.renderServerStylesTag was called by writePageForSend', () => {
        expect(mockSsrStylesCollectors[renderIndex].toString).toHaveBeenCalled();
      });
      it('response.status was called with the status code 200', () => {
        expect(res.status).toHaveBeenCalledWith(200);
      });
      it('response.send was called with the expected send result', () => {
        expect(res.send).toHaveBeenCalledWith(EXPECTED_HTML);
      });
    });
  });
});
