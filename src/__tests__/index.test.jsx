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

const mockServer = { default: { handle: jest.fn() } };
jest.mock('../server', () => mockServer);

describe('application index.jsx, no hot module reloading', () => {
  let consoleErrorSpy;
  let consoleLogSpy;
  beforeAll(() => {
    global.module = {};
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(); // mocking to prevent logging when running tests
    // Load up the app index
    require('../index');
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    delete global.module;
  });
  it('express() has been called', () => {
    expect(mockExpress).toHaveBeenCalled();
  });
  it('express instance use() was called', () => {
    expect(mockServerInstance.use).toHaveBeenCalledWith(mockUseCallback);
  });
  it('express instance listen() was called', () => {
    expect(mockServerInstance.listen).toHaveBeenCalledWith(3000, mockListenCallback);
  });
  describe('use callback called with request and response', () => {
    let request;
    let response;
    beforeAll(() => {
      request = { request: true };
      response = { response: true };
      mockUseCallback(request, response);
    });
    it('server.default.handle callback received request and response', () => {
      expect(mockServer.default.handle).toHaveBeenCalledWith(request, response);
    });
  });
  // The testing of the error condition done in `index_hot.test.jsx`
  describe('listen callback called without error', () => {
    beforeAll(() => {
      mockListenCallback();
    });
    it('console logs "started" message', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('> Started on port 3000');
    });
    it('console error not called', () => {
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
