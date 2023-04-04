const VERSION = 14

const coordsEl = document.querySelector('div[title="Координаты пикселя."]')

function getCoords(){
    const text = coordsEl.innerText;
    const [x, y] = text.split(', ');
    return [x, y].map(x => +x);
}

function initHandler(){
    document.addEventListener('mousemove', updateTemplate);
}

let imgCtx, temCtx, imgW, imgH;

async function loadTemplate(){
    return new Promise((res, rej) => {
        const link = 'https://i.imgur.com/Q1hL23z.png';
        const img = new Image();

        img.crossOrigin = 'anonymous';
        img.src = link;
        img.onload = () => {
            const canvas = document.createElement('canvas');

            canvas.crossOrigin = 'anonymous';
            canvas.width = img.width;
            canvas.height = img.height;

            const _ctx = canvas.getContext('2d');
            _ctx.drawImage(img, 0, 0);

            imgCtx = _ctx;
            imgW = img.width;
            imgH = img.height;

            res();
        }
        img.onerror = rej;
    })
}

// нечётное число, иначе будет не ровно
const TEM_W = 9;
const TEM_H = 9;
const TEM_ZOOM = 10;

async function initTemplate(){
    await loadTemplate();

    const templateGrid = document.createElement('canvas');
    templateGrid.width = TEM_W*TEM_ZOOM;
    templateGrid.height = TEM_H*TEM_ZOOM;

    templateGrid.style.cssText = `
        position: absolute;
        bottom: 62px;
        right: 242px;
        border: 1px solid black;
        border-radius: 5px;
        z-index: 100;
    `;

    temCtx = templateGrid.getContext('2d');

    document.body.appendChild(templateGrid);
    initHandler();
}

function getColor(imgData, x, y, width){
    const i = (x + y * width)*4;

    const r = imgData[i];
    const g = imgData[i+1];
    const b = imgData[i+2];
    const a = imgData[i+3];

    return [r,g,b,a];
}

let lastX, lastY;
function drawTemplate(){
    temCtx.clearRect(0, 0, TEM_W*TEM_ZOOM, TEM_H*TEM_ZOOM)

    const [cordx, cordy] = [lastX, lastY];

    const halfWidth = TEM_W/2|0;
    const halfHeight = TEM_H/2|0;

    const xStart = cordx - halfWidth;
    const yStart = cordy - halfHeight;
    const xEnd = cordx + halfWidth + 1;
    const yEnd = cordy + halfHeight + 1;

    // рисуем шаблон
    const data = imgCtx.getImageData(xStart, yStart, xEnd-xStart, yEnd-yStart).data;
    for(let x = 0; x < TEM_W; x++){
        for(let y = 0; y < TEM_H; y++){
            const [r,g,b,a] = getColor(data, x, y, xEnd-xStart);
            const cssColor = `rgba(${r},${g},${b},${a})`;

            temCtx.fillStyle = cssColor;
            temCtx.fillRect(x*TEM_ZOOM, y*TEM_ZOOM, TEM_ZOOM, TEM_ZOOM);
        }
    }

    // рисуем сетку
    temCtx.fillStyle = 'black';
    temCtx.strokeStyle = 'black';
    temCtx.lineWidth = 1;

    temCtx.beginPath();
    for(let lineX = 0; lineX < TEM_W; lineX++){
        temCtx.moveTo(lineX*TEM_ZOOM, 0);
        temCtx.lineTo(lineX*TEM_ZOOM, TEM_W*TEM_ZOOM);
    }

    for(let lineY = 0; lineY < TEM_W; lineY++){
        temCtx.moveTo(0, lineY*TEM_ZOOM);
        temCtx.lineTo(TEM_H*TEM_ZOOM, lineY*TEM_ZOOM);
    }

    temCtx.stroke();

    // ну и посерединке квадратик с обводкой
    temCtx.lineWidth = 3;
    temCtx.strokeStyle = 'white';
    temCtx.strokeRect(halfWidth*TEM_ZOOM, halfHeight*TEM_ZOOM, TEM_ZOOM, TEM_ZOOM)
    temCtx.lineWidth = 2;
    temCtx.strokeStyle = 'black';
    temCtx.strokeRect(halfWidth*TEM_ZOOM, halfHeight*TEM_ZOOM, TEM_ZOOM, TEM_ZOOM)
}

function updateTemplate(){
    const [x, y] = getCoords();
    if(x === lastX && y === lastY){
        return;
    }

    [lastX, lastY] = [x,y];

    drawTemplate();
}

initTemplate();
