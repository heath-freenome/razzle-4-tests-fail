import isBrowser from '../../utils/isBrowser';

describe('isBrowser', () => {
  it('returns true when window exists', () => {
    expect(isBrowser()).toBe(true);
  });
  describe('when window does not exist in an SSR usage', () => {
    let oldWindow;
    beforeAll(() => {
      oldWindow = global.window;
      delete global.window; // temporarily delete window to test the SSR path
    });
    afterAll(() => {
      global.window = oldWindow;
    });
    it('returns false when window does not exist', () => {
      expect(isBrowser()).toBe(false);
    });
  });
});
