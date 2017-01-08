import React from 'react';
import Actions from '../actions';
import photoStore from '../stores/photo_store';

export default class BaseComponent extends React.Component {
  constructor() {
    super();
    this.actions = Actions;
    this.photoStore = photoStore;
    if (this.onChange) this.changeListener = this.onChange.bind(this);
  }
}
