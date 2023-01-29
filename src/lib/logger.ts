const isEnabled = true;

export function log(...args: any[]): void {
    if (isEnabled) {
        console.debug(...args);
    }
}

export function logJSON(...args: any[]): void {
    if (isEnabled) {
        args.forEach((argument) => {
            console.debug(JSON.stringify(argument, null, 2));
        });
    }
}

export function logError(...args: any[]): void {
    if (isEnabled) {
        console.error(...args);
    }
}