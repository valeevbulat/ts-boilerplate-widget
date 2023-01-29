import {MultiplierWidget} from "../lib";
const myLibraryInstance1 = new MultiplierWidget({
    widgetSelector: '#light-multiplier-place',
    baseApiUrl: 'https://api-dev.multiplier.gg/api',
});
const myLibraryInstance2 = new MultiplierWidget({
    widgetSelector: '#dark-multiplier-place',
    baseApiUrl: 'https://api-dev.multiplier.gg/api',
});

document.querySelector("body").innerHTML = `
    <h2>Light Widget</h2>
    <div style="padding: 100px 30px; background: #eeeeee;">
        <div id="light-multiplier-place"></div>
    </div>
    <h2>Dark Widget</h2>
    <div style="padding: 100px 30px; background: #0d0d0d;">
        <div id="dark-multiplier-place"></div>
    </div>
    <h2>Push event button</h2>
    <div style="padding: 100px 30px; background: #0d0d0d;">
        <button id="push-event-button">PUSH EVENT</button>
    </div>
`;

const btn = document.getElementById('push-event-button');
btn.addEventListener('click', () => {
    myLibraryInstance1.pushEvent(728);
})

myLibraryInstance1.init({ theme: 'light' });
myLibraryInstance2.init({ theme: 'dark' });