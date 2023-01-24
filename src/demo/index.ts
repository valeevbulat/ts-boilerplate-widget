import MyLibrary from "../lib";
const myLibraryInstance1 = new MyLibrary({ mcode: 'yourmcode' });
const myLibraryInstance2 = new MyLibrary();

document.querySelector("body").innerHTML = `
    <h2>Light Widget</h2>
    <div style="padding: 100px 30px; background: #eeeeee;">
        <div id="light-multiplier-place-1"></div>
        <br/>
        <div id="light-multiplier-place-2"></div>
    </div>
    <h2>Dark Widget</h2>
    <div style="padding: 100px 30px; background: #0d0d0d;">
        <div id="dark-multiplier-place-1"></div>
        <br/>
        <div id="dark-multiplier-place-2"></div>
    </div>
`;

myLibraryInstance1.init({ elementSelector: '#light-multiplier-place-1', theme: 'light' });
myLibraryInstance2.init({ elementSelector: '#light-multiplier-place-2', theme: 'light' });
myLibraryInstance1.init({ elementSelector: '#dark-multiplier-place-1', theme: 'dark' });
myLibraryInstance2.init({ elementSelector: '#dark-multiplier-place-2', theme: 'dark' });