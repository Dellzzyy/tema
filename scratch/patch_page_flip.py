with open('js/page-flip.browser.js', 'r', encoding='utf-8') as f:
    c = f.read()

target1 = 'flip(t){if(this.app.getSettings().disableFlipByClick&&!this.isPointOnCorners(t))return;'
replacement1 = 'flip(t,isProg=false){if(!isProg&&this.app.getSettings().disableFlipByClick&&!this.isPointOnCorners(t))return;'
assert target1 in c, 'target1 not found'
c = c.replace(target1, replacement1, 1)

idx_start = c.find('flipNext(t="top",p=null){')
idx_end = c.find('}stopMove(){if(null===this.') + 1
target2 = c[idx_start:idx_end]
print('Found target2:\n', target2)

replacement2 = '''flipNext(t="top",p=null){
if(p)window.__currentFlipPattern=p;
const e=this.render.getRect();
const isPortrait="portrait"===this.render.getOrientation();
const bookWidth=isPortrait?e.pageWidth:(e.width||2*e.pageWidth);
let yPos="top"===t?5:e.height-5;
if(typeof t==="number")yPos=t;
else if("center"===t)yPos="top";
this.flip({x:e.left+bookWidth-10,y:yPos},true);
}
flipPrev(t="top",p=null){
if(p)window.__currentFlipPattern=p;
const e=this.render.getRect();
let yPos="top"===t?5:e.height-5;
if(typeof t==="number")yPos=t;
else if("center"===t)yPos="top";
this.flip({x:e.left+10,y:yPos},true);
}'''

c = c[:idx_start] + replacement2 + c[idx_end:]

with open('js/page-flip.browser.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('js/page-flip.browser.js patched successfully!')
