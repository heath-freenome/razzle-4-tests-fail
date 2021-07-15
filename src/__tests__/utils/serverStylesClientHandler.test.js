import serverStylesClientHandler, { SERVER_STYLES_ID } from '../../utils/serverStylesClientHandler';

describe('serverStylesClientHandler', () => {
  let oldDocumentQuerySelector;
  let mockParentElement;
  let mockChildElement;
  beforeAll(() => {
    mockParentElement = { removeChild: jest.fn() };
    mockChildElement = { parentElement: mockParentElement };
    oldDocumentQuerySelector = document.querySelector;
    document.querySelector = jest.fn().mockReturnValueOnce(null).mockReturnValue(mockChildElement);
  });
  afterAll(() => {
    document.querySelector = oldDocumentQuerySelector;
  });
  describe('server-side', () => {
    let oldWindow;
    beforeAll(() => {
      oldWindow = global.window;
      delete global.window; // temporarily delete window to test the SSR path
      serverStylesClientHandler();
    });
    afterAll(() => {
      global.window = oldWindow;
    });
    it('does not call the document querySelector() function', () => {
      expect(document.querySelector).not.toHaveBeenCalled();
    });
  });
  describe('client-side, no style tag found', () => {
    beforeAll(() => {
      serverStylesClientHandler();
    });
    it('gets the SERVER_STYLES_ID from the document', () => {
      expect(document.querySelector).toHaveBeenCalledWith(`#${SERVER_STYLES_ID}`);
    });
    it('does not calls removeElement on the parent of the returned element', () => {
      expect(mockParentElement.removeChild).not.toHaveBeenCalled();
    });
  });
  describe('client-side, style tag exists', () => {
    beforeAll(() => {
      serverStylesClientHandler();
    });
    it('gets the SERVER_STYLES_ID from the document', () => {
      expect(document.querySelector).toHaveBeenCalledWith(`#${SERVER_STYLES_ID}`);
    });
    it('calls removeElement on the parent of the returned element', () => {
      expect(mockParentElement.removeChild).toHaveBeenCalledWith(mockChildElement);
    });
  });
});
