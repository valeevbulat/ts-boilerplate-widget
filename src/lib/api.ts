import {TMcode} from "./multiplierWidget";
import {logError} from "./logger";

export interface IMultiplierWidgetEvent {
    /**
     * Multiplier code of user who referrer the client
     */
    multiplierCode: string;

    /**
     * Identifier of an offer
     */
    offerId?: number;
}

export interface IMultiplierWidgetEventResponse {
    // TODO: add additional parameters
    success: boolean;
}

export class Api {
    protected _mcode: TMcode;

    protected constructor(public baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public get mcode(): TMcode {
        return this._mcode;
    }

    protected getApiUrl(postfix: string): string {
        return this.baseUrl + postfix;
    }

    protected api<T>(url: string, options?: RequestInit): Promise<T> {
        return fetch(this.getApiUrl(url), options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json() as Promise<T>
            })
    }

    protected checkMultiplierCode(mcode: string) {
        return this.api<{
            id: number;
            name: string;
            tier: number;
        }>(`/multiplier_codes/${mcode}`);
    }

    protected pairMultiplierCode() {
        return this.api('/pair-user-mcode', { method: 'post' });
    }

    public pushEvent(offerId?: number) {
        if (!this._mcode) {
            logError('MultiplierWidget: does not have mcode for pushEvent');
            return;
        }

        const event: IMultiplierWidgetEvent = {
            multiplierCode: this.mcode,
            offerId,
        }

        return this.api<IMultiplierWidgetEventResponse>('/event', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(event)
        });
    }
}
