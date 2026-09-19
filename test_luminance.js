const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
const document = dom.window.document;

function getComputedColor(colorStr) {
    const div = document.createElement('div');
    div.style.backgroundColor = colorStr;
    div.style.display = 'none';
    document.body.appendChild(div);
    const computed = dom.window.getComputedStyle(div).backgroundColor;
    document.body.removeChild(div);
    return computed;
}

console.log(getComputedColor('oklch(1 0 0)'));
