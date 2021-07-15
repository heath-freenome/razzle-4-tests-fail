const FAILED = 'FAILED!';
const ERROR = new Error(FAILED);
/** Mock express to track calls to the creation of the server instance, and the execution of the parts
 * of the server instance, including capturing the server's use and listen callback functions
 */
let mockUseCallback;
let mockListenCallback;
let mockServerInstance;
const mockExpress = jest.fn(() => {
  mockServerInstance = {};
  mockServerInstance.use = jest.fn((callback) => {
    mockUseCallback = callback;
    return mockServerInstance;
  });
  mockServerInstance.listen = jest.fn((_, callback) => {
    mockListenCallback = callback;
    return mockServerInstance;
  });
  return mockServerInstance;
});
jest.mock('express', () => mockExpress);

const mockServer = { default: null };
jest.mock('../server', () => mockServer);

const server1 = { handle: jest.fn().mockName('server 1') };
const server2 = { handle: jest.fn().mockName('server 2') };
const defaultGetter = jest
  .fn()
  .mockReturnValueOnce(server1)
  .mockReturnValueOnce(server2)
  .mockImplementation(() => {
    throw ERROR;
  });
Object.defineProperty(mockServer, 'default', {
  get: defaultGetter,
});

const REQUEST = { request: true };
const RESPONSE = { RESPONSE: true };

describe('application index.jsx, with hot module reloading on port 5000', () => {
  let consoleErrorSpy;
  let consoleInfoSpy;
  let consoleLogSpy;
  let acceptCallback;
  beforeAll(() => {
    global.module = {
      hot: {
        accept(_, callback) {
          acceptCallback = callback;
        },
      },
    };
    process.env.PORT = 5000;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(); // mocking to prevent logging an error when running tests
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(); // mocking to prevent logging when running tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(); // mocking to prevent logging when running tests
    // Load up the app index
    require('../index');
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
    delete process.env.PORT;
    delete global.module;
  });
  it('express() has been called', () => {
    expect(mockExpress).toHaveBeenCalled();
  });
  it('express instance use() was called', () => {
    expect(mockServerInstance.use).toHaveBeenCalledWith(mockUseCallback);
  });
  it('express instance listen() was called', () => {
    expect(mockServerInstance.listen).toHaveBeenCalledWith(process.env.PORT, mockListenCallback);
  });
  it('server loaded once', () => {
    expect(defaultGetter).toHaveBeenCalledTimes(1);
  });
  it('console info was called with HMR message', () => {
    expect(consoleInfoSpy).toHaveBeenCalledWith('✅  Server-side HMR Enabled!');
  });
  describe('use callback for server1 called with REQUEST and RESPONSE', () => {
    beforeAll(() => {
      mockUseCallback(REQUEST, RESPONSE);
    });
    it('server.handle callback received REQUEST and RESPONSE', () => {
      expect(server1.handle).toHaveBeenCalledWith(REQUEST, RESPONSE);
    });
  });
  // The testing of the good condition done in `index.test.jsx`
  describe('listen callback called with error', () => {
    beforeAll(() => {
      mockListenCallback(FAILED);
    });
    it('console log not called', () => {
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
    it('console error was called with FAILED', () => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(FAILED);
    });
  });
  describe('hot module update triggered', () => {
    beforeAll(() => {
      consoleErrorSpy.mockClear();
      acceptCallback();
    });
    it('server loaded twice', () => {
      expect(defaultGetter).toHaveBeenCalledTimes(2);
    });
    it('console logs reloading message', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('🔁  HMR Reloading `./server`...');
    });
    it('console error not called', () => {
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
    describe('use callback for server2 called with REQUEST and RESPONSE', () => {
      beforeAll(() => {
        mockUseCallback(REQUEST, RESPONSE);
      });
      it('server.handle callback received REQUEST and RESPONSE', () => {
        expect(server2.handle).toHaveBeenCalledWith(REQUEST, RESPONSE);
      });
    });
  });
  describe('hot module update triggered again, fails', () => {
    beforeAll(() => {
      consoleLogSpy.mockClear();
      acceptCallback();
    });
    it('server loaded 3 times', () => {
      expect(defaultGetter).toHaveBeenCalledTimes(3);
    });
    it('console logs reloading message', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('🔁  HMR Reloading `./server`...');
    });
    it('console error was called with error', () => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(ERROR);
    });
  });
});
