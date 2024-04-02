/* Base Class */
// "use strict";

import Context from './context';

class BaseClass {

  _element:any;
  constructor(element: any) {
    element = typeof element === 'string' ? document.querySelector(element) : element;

    if (!element) {
      return;
    }

    this._element = element;
    Context.set(this._element, (this.constructor as any)['COMPONENT_KEY'], this);
  }

  dispose() {
    Context.remove(this._element, (this.constructor as any)['COMPONENT_KEY']);
    this._element = null;
  }

  /* Static */
  static getContext(element: any) {
    return Context.get(element, (this.constructor as any)['COMPONENT_KEY']);
  }
}

export default BaseClass