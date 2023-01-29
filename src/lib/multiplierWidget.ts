import {Api} from "./api";
import Cookies from "js-cookie";

import '@openfonts/dm-sans_latin';
import "./styles/index.css";
import {log, logError, logJSON} from "./logger";

export type TMcode = string | null;
export type TTheme = 'dark' | 'light';

export interface IMultiplierWidgetInitOptions {
    theme: TTheme;
    placeholder?: string;
}

export interface IMultiplierWidgetCreateOptions {
    widgetSelector: string | null;
    baseApiUrl: string;
    mcodeSearchParam?: string;
    mcodeCookieKey?: string;
    // visible?: boolean;
}

const customDocument = typeof document !== 'undefined' ? document : null

export class MultiplierWidget extends Api {
    public placeholder = '';

    public theme: TTheme = 'light';

    public mcodeCookieKey: string;

    public mcodeSearchParam: string;

    public visible: boolean;

    private fieldValue = '';

    private fieldError = '';

    private initiated = false;

    private readonly widgetSelector: string | null;

    private readonly formId: string = MultiplierWidget.getRandomId('mp-');

    private readonly fieldId: string = MultiplierWidget.getRandomId('mp-');

    private readonly fieldButtonId: string = MultiplierWidget.getRandomId('mp-');

    private readonly fieldErrorId: string = MultiplierWidget.getRandomId('mp-');

    constructor({
        widgetSelector,
        baseApiUrl,
        mcodeCookieKey = 'mcode',
        mcodeSearchParam = 'multiplier_code',
    }: IMultiplierWidgetCreateOptions) {
        super(baseApiUrl);
        this.widgetSelector = widgetSelector;
        this.mcodeCookieKey = mcodeCookieKey || 'mcode';
        this.mcodeSearchParam = mcodeSearchParam || 'multiplier_code';
        this._mcode = Cookies.get(this.mcodeCookieKey) || null;
        this.visible = true; //!this._mcode;

        logJSON("MultiplierWidget: create", {
            widgetSelector,
            baseApiUrl,
            mcodeCookieKey,
            mcodeSearchParam,
        });
    }

    protected setMcode(value: TMcode) {
        this._mcode = value;

        if (this.initiated) {
            this.renderWidget();
        }
    }

    public async checkQueryParam() {
      const searchParams = new URLSearchParams(window.location.search);
      const mcode = searchParams.get(this.mcodeSearchParam) as string | undefined;

      if (!mcode || this.mcode) {
          return;
      }

      this.setFieldValue(mcode.trim());

      await this.saveMcode();
    }

    public init({theme, placeholder = "Multiplier Code"}: IMultiplierWidgetInitOptions): void {
        logJSON("MultiplierWidget: init", {theme, placeholder});
        this.theme = theme;
        this.placeholder = placeholder;

        this.renderWidget();
        this.checkQueryParam();
    }

    public static isValidMcode(value: string) {
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    private renderWidget() {
        if (!this.visible) {
            return;
        }

        let className = `mp-widget ${this.theme === 'dark' ? 'mp-widget--dark' : 'mp-widget--light'}`;

        if (this.mcode) {
            className += ' mp-widget--active-mcode';
        }

        this.render(`
      <form class="${className}" id="${this.formId}">
          ${this.mcode ? this.renderMcode() : this.renderField()}
          ${this.renderError()}
      </form>
    `);

        this.addListeners();

        this.initiated = true;
        log("MultiplierWidget: widget initiated");
    }

    private renderMcode(): string {
        return `
            <label for="${this.fieldId}" class="mp-widget__field-wrapper">
              <input id="${this.fieldId}" class="mp-widget__field" type="text" readonly value="${this.mcode?.toLowerCase()}"/>
            </label>
      `;
    }

    private renderField(): string {
        return `
            <label for="${this.fieldId}" class="mp-widget__field-wrapper">
              <input id="${this.fieldId}" class="mp-widget__field" type="text" placeholder="${this.placeholder}" />
              <button id="${this.fieldButtonId}" type="submit" class="mp-widget__field-btn"></button>
            </label>
      `;
    }

    private renderError(): string {
        return `
            <div id="${this.fieldErrorId}" class="mp-widget__field-error">${this.fieldError}</div>
      `;
    }

    private addListeners() {
        if (this.mcode || !customDocument) {
            return;
        }

        const form = customDocument.getElementById(this.formId);
        const field = customDocument.getElementById(this.fieldId);

        if (field) {
            field.addEventListener('input', this.onChange)
        }

        if (form) {
            form.addEventListener('submit', this.onSubmit);
        }
    }

    private onChange = (event: Event) => {
        event.preventDefault();
        this.fieldValue = this.getFieldValue();
    }

    private onSubmit = (event: SubmitEvent) => {
        event.preventDefault();
        return this.saveMcode();
    }

    private async saveMcode() {
        try {
            if (!this.fieldValue) {
                return;
            }

            this.error = MultiplierWidget.validateMcode(this.fieldValue);

            if (this.fieldError) {
                return;
            }

            this.toggleFieldButtonLoading(true);

            log("MultiplierWidget: start save mcode: " + this.fieldValue);

            await this.checkMultiplierCode(this.fieldValue);

            await new Promise((resolve) => {
                setTimeout(() => {
                    Cookies.set(this.mcodeCookieKey, this.fieldValue);
                    resolve(true);
                }, 3000)
            })

            this.setMcode(this.fieldValue);

            this.renderWidget()

            log("MultiplierWidget: end save mcode");
        } catch (error) {
            this.error = 'This m-code is not exist';
            logError(error);
        } finally {
            this.toggleFieldButtonLoading(false);
        }
    }

    private static validateMcode = (value: string): string => {
        let error = '';

        if (!value) {
            error = 'Please enter your mcode';
        } else if (value.length < 3 || value.length > 30) {
            error = 'M-code must be between 3 and 30 symbols';
        } else if (!MultiplierWidget.isValidMcode(value)) {
            error = 'Please only use letters or numbers';
        }

        return error;
    };

    private getFieldValue() {
        if (!customDocument) {
            return;
        }

        const node = customDocument.getElementById(this.fieldId) as HTMLInputElement;

        if (!node) {
            return;
        }

        return node.value.trim();
    }

    private setFieldValue(value: string) {
        if (!customDocument) {
            return;
        }

        const node = customDocument.getElementById(this.fieldId) as HTMLInputElement;

        if (!node) {
            return;
        }

        this.fieldValue = value;
        node.value = value;
    }

    private set error(value: string) {
        if (!customDocument) {
            return;
        }

        const node = customDocument.getElementById(this.fieldErrorId) as HTMLDivElement;

        if (!node) {
            return;
        }

        this.fieldError = value;
        node.innerHTML = this.fieldError || '';

        if (this.fieldError) {
            node.classList.add('mp-d-block', 'shake');
        } else {
            node.classList.remove('mp-d-block', 'shake');
        }
    }

    private toggleFieldButtonLoading(loading: boolean) {
        MultiplierWidget.toggleButtonLoading(loading, this.fieldButtonId, 'mp-widget__field-btn--loading')
    }

    private render(content: string) {
        if (!customDocument) {
            return;
        }
        const node = customDocument.querySelector(this.widgetSelector);

        if (!node) {
            logError('MultiplierWidget Error: not found element with selector: ' + this.widgetSelector);
            return;
        }

        node.innerHTML = content;
    }

    private static toggleButtonLoading(loading: boolean, id: string, loadingClassName: string) {
        if (!customDocument) {
            return;
        }
        const node = customDocument.getElementById(id) as HTMLButtonElement;

        if (!node) {
            return;
        }

        if (loading) {
            node.disabled = true;
            node.classList.add(loadingClassName)
        } else {
            node.disabled = false;
            node.classList.remove(loadingClassName)
        }
    }

    private static getRandomId(prefix: string) {
        return prefix + Math.random().toString(16).slice(2)
    }
}