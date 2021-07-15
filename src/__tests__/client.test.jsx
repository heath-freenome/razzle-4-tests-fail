import React from 'react';

import Routes from '../routes';

const mockHydrate = jest.fn();
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  hydrate: mockHydrate,
}));

/** Mock the Routes component to be avoid actually pulling in the whole hierarchy
 */
jest.mock('../routes', () => () => <div />);

const FAKE_DOM = { fakeDom: true };

describe('client.jsx no hot module reloading', () => {
  let oldGetElementById;
  beforeAll(() => {
    oldGetElementById = document.getElementById;
    document.getElementById = jest.fn(() => FAKE_DOM);
    // Our custom `hotModulesPreprocessor` has changed `module.hot` to `global.module.hot`
    global.module = {};
    // Load up the client file
    require('../client');
  });
  afterAll(() => {
    document.getElementById = oldGetElementById;
    delete global.module;
  });
  it('document.getElementById was called', () => {
    expect(document.getElementById).toHaveBeenCalledWith('react-root');
  });
  it('ReactDom.hydrate was called', () => {
    expect(mockHydrate).toHaveBeenCalledWith(<Routes />, FAKE_DOM);
  });
});
