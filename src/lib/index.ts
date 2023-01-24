import "./styles/index.css";

import '@openfonts/dm-sans_latin';

export type TMcode = string | null;

export interface IMultiplierWidgetInitOptions {
  elementSelector: string;
  theme: 'dark' | 'light';
  placeholder?: string;
}

class MultiplierWidget {
  mcode: TMcode = null;
  fieldId: string;

  constructor({ mcode = null }: { mcode?: TMcode } = {}) {
    this.mcode = mcode;
    console.debug("MultiplierWidget loaded");
  }

  init = ({ elementSelector, theme, placeholder = "Multiplier Code" }: IMultiplierWidgetInitOptions) => {
    const className = `mp-widget ${theme === 'dark' ? 'mp-widget--dark' : 'mp-widget--light'} ${this.mcode ? 'mp-widget--active-mcode' : ''}`;
    this.fieldId = MultiplierWidget.getRandomId('mp-');
    if (this.mcode) {
      this.render(elementSelector, `
        <div class="${className}">
            <label for="${this.fieldId}" class="mp-widget__field-wrapper">
              <input id="${this.fieldId}" class="mp-widget__field" type="text" readonly value="${this.mcode.toLowerCase()}"/>
            </label>
        </div>
      `);
    } else {
      /** Loading button
       <button class="mp-widget__field-btn mp-widget__field-btn--loading" disabled></button>
       */
      this.render(elementSelector, `
        <div class="${className}">
            <label for="${this.fieldId}" class="mp-widget__field-wrapper">
              <input id="${this.fieldId}" class="mp-widget__field" type="text" placeholder="${placeholder}" />
              <button class="mp-widget__field-btn"></button>
            </label>
        </div>
      `);
    }

    console.debug("MultiplierWidget initiated");
  };

  render(elementSelector: string, content: string) {
    const node = document.querySelector(elementSelector);
    if (!node) {
      console.debug('Multiplier Widget not found element with selector: ' + elementSelector)
      return;
    }

    node.innerHTML = content;
  }

  static getRandomId(prefix: string) {
    return prefix+Math.random().toString(16).slice(2)
  }
}

export default MultiplierWidget;
