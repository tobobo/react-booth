import React from 'react';
import Actions from '../actions';

export default class BaseComponent extends React.Component {
  constructor() {
    super();
    this.actions = Actions;
    if (this.onChange) this.changeListener = this.onChange.bind(this);
  }
}
