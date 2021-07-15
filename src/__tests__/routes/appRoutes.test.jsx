import { shallow } from 'enzyme';
import React from 'react';
import { Redirect, Switch, Route } from 'react-router';
import { BrowserRouter, StaticRouter } from 'react-router-dom';

import AppRoutes from '../../routes/appRoutes';
import Home from '../../routes/home/home';

describe('AppRoutes', () => {
  describe('client side', () => {
    let props;
    let wrapper;
    beforeAll(() => {
      props = { routerProps: {} };
      wrapper = shallow(<AppRoutes {...props} />);
    });
    it('renders', () => {
      expect(wrapper).toExist();
    });
    it('is an outer BrowserRouter', () => {
      const router = wrapper.find(BrowserRouter);
      expect(wrapper).toEqual(router);
    });
    it('has one child', () => {
      expect(wrapper.children()).toHaveLength(1);
    });
    describe('Switch', () => {
      let routerSwitch;
      beforeAll(() => {
        routerSwitch = wrapper.children(Switch);
      });
      it('is contained in the Router', () => {
        expect(routerSwitch).toExist();
      });
      it('has two children', () => {
        expect(routerSwitch.children()).toHaveLength(2);
      });
      describe('routes', () => {
        it('contains a single Route with the expected props', () => {
          const loginRoute = routerSwitch.children(Route);
          expect(loginRoute).toExist();
          expect(loginRoute).toHaveProp({
            exact: true,
            path: '/home',
            component: Home,
          });
        });
        it('contains a Redirect to the default path', () => {
          const redirect = routerSwitch.children(Redirect);
          expect(redirect).toExist();
          expect(redirect).toHaveProp('to', '/home');
        });
      });
    });
  });
  describe('server side', () => {
    let props;
    let wrapper;
    let oldWindow;
    beforeAll(() => {
      oldWindow = global.window;
      delete global.window; // temporarily delete window to test the SSR path
      props = { routerProps: { location: '/home' } };
      wrapper = shallow(<AppRoutes {...props} />);
    });
    afterAll(() => {
      global.window = oldWindow;
    });
    it('renders', () => {
      expect(wrapper).toExist();
    });
    it('is an outer StaticRouter', () => {
      const router = wrapper.find(StaticRouter);
      expect(wrapper).toEqual(router);
    });
    it('has the expected props', () => {
      expect(wrapper).toHaveProp(props.routerProps);
    });
    it('has one child', () => {
      expect(wrapper.children()).toHaveLength(1);
    });
    describe('Switch', () => {
      let routerSwitch;
      beforeAll(() => {
        routerSwitch = wrapper.children(Switch);
      });
      it('is contained in the Router', () => {
        expect(routerSwitch).toExist();
      });
      it('has two children', () => {
        expect(routerSwitch.children()).toHaveLength(2);
      });
      describe('routes', () => {
        it('contains a single Route with the expected props', () => {
          const loginRoute = routerSwitch.children(Route);
          expect(loginRoute).toExist();
          expect(loginRoute).toHaveProp({
            exact: true,
            path: '/home',
            component: Home,
          });
        });
        it('contains a Redirect to the default path', () => {
          const redirect = routerSwitch.children(Redirect);
          expect(redirect).toExist();
          expect(redirect).toHaveProp('to', '/home');
        });
      });
    });
  });
});
