import { shallow } from 'enzyme';
import React from 'react';
import { Grid, Typography } from '@material-ui/core';

import Home from '../../../routes/home/home';

describe('Home', () => {
  let wrapper;
  beforeAll(() => {
    wrapper = shallow(<Home />);
  });
  it('renders', () => {
    expect(wrapper).toExist();
  });
  it('renders an outer Grid', () => {
    const grid = wrapper.find(Grid);
    expect(grid).toEqual(wrapper);
  });
  it('Grid is an item with sm=12', () => {
    expect(wrapper).toHaveProp({
      item: true,
      sm: 12,
    });
  });
  it('has one child', () => {
    expect(wrapper.children()).toHaveLength(1);
  });
  describe('Typography', () => {
    let typography;
    beforeAll(() => {
      typography = wrapper.children(Typography);
    });
    it('is contained in the Grid Item', () => {
      expect(typography).toExist();
    });
    it('has the expected props', () => {
      expect(typography).toHaveProp({
        variant: 'h2',
        gutterBottom: true,
        children: 'Hello World',
      });
    });
  });
});
