import { shallow } from 'enzyme';
import React from 'react';

import Routes from '../../routes';
import AppRoutes from '../../routes/appRoutes';
import serverStylesClientHandler from '../../utils/serverStylesClientHandler';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn().mockImplementation((fn) => fn()),
}));

jest.mock('../../utils/serverStylesClientHandler');

const OTHER_PROPS = { location: '/url', context: {} };

describe('Routes', () => {
  describe('no props', () => {
    let wrapper;
    beforeAll(() => {
      wrapper = shallow(<Routes />);
    });
    it('rendered', () => {
      expect(wrapper).toExist();
    });
    it('renders an AppRoutes', () => {
      const appRoutes = wrapper.find(AppRoutes);
      expect(appRoutes).toEqual(wrapper);
    });
    it('has the expected props', () => {
      expect(wrapper).toHaveProp({
        routerProps: {},
      });
    });
    it('serverStylesClientHandler was called', () => {
      expect(serverStylesClientHandler).toHaveBeenCalledTimes(1);
    });
  });
  describe('store plus a few other props', () => {
    let wrapper;
    let props;
    beforeAll(() => {
      props = { ...OTHER_PROPS };
      wrapper = shallow(<Routes {...props} />);
    });
    it('rendered', () => {
      expect(wrapper).toExist();
    });
    it('renders an AppRoutes', () => {
      const appRoutes = wrapper.find(AppRoutes);
      expect(appRoutes).toEqual(wrapper);
    });
    it('has the expected props', () => {
      expect(wrapper).toHaveProp({
        routerProps: OTHER_PROPS,
      });
    });
    it('serverStylesClientHandler was called', () => {
      expect(serverStylesClientHandler).toHaveBeenCalledTimes(2);
    });
  });
});
