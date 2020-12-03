let ImageList = document.getElementById('image-list');

window.addEventListener('DOMMouseScroll', scroll, false); // older FF
window.addEventListener(wheelEvent, scroll, wheelOpt); // modern desktop
window.addEventListener('touchmove', scroll, wheelOpt); // mobile
window.addEventListener('keydown', scroll, false);
let XAxis = document.getElementById('x-Axis');
let YAxis = document.getElementById('y-Axis');
ImageList.addEventListener('dblclick', doubleClick);
ImageList.addEventListener('mousedown', event => mouseDownHandler(event));
window.addEventListener('keydown', keyDown);
let distanceAround = vh(20);
let sizeMultiplier = 2;
let zoomSpeed = 1.2;
let maxZoom = 8;
let minZoom = 0.6;
let currentScrollX = 0;
let currentScrollY = 0;

let axises = [
    { name: 'age', direction: 'x', sort: 'down', groups: [] },
    { name: 'size', direction: 'y', sort: 'up', groups: [] }
];

loadImages();
initAxises();
setCurrentScroll();
//disableScroll();

// image functions
function loadImages() {
    let images = initImages();
    images.forEach(img => {
        let elem = document.createElement("img");
        elem.setAttribute("src", "./images/" + img.path);
        elem.setAttribute("height", sizeMultiplier * img.height);
        elem.setAttribute("width", sizeMultiplier * img.width);
        elem.setAttribute("id", img.path);
        elem.style.left = img.posX + "px";
        elem.style.top = img.posY + "px";
        ImageList.append(elem);
    });

}
function initImages() {
    let images = getImages();
    images = applyAxisToImages(images, 0);
    images = applyAxisToImages(images, 1);
    return images;
}
function applyAxisToImages(images, axisId) {
    axises[axisId].groups = createAxisGroups(images, axises[axisId].direction, axisId);
    switch (axises[axisId].sort) {
        case 'up':
            axises[axisId].groups = axises[axisId].groups.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            break;
        case 'down':
            axises[axisId].groups = axises[axisId].groups.sort((a,b) => (a.name < b.name) ? 1 : ((b.name < a.name) ? -1 : 0));
        default:
            new Error('Sort direction ' + axises[axisId].sort + ' of axis not implemented yet.')
    }

    applyAxisSizesToBoard(axises[axisId].groups, axises[axisId].direction);
    images = applySizesToImages(images, axises[axisId].groups, axises[axisId].direction, axisId);

    return images;
}
function applySizesToImages(images, axisGroups, axisDirection, axisId) {
    for (let i = 0; i < images.length; i++) {
        let absolutePos = calcAbsolutePositionOfImage(images[i], axisGroups, axisId);
        switch(axisDirection) {
            case 'x':
                images[i].posX = absolutePos;
                break;
            case 'y':
                images[i].posY = absolutePos;
                break;
            default:
                throw new Error('applySizesToImages: axis direction ' + axisDirection + ' not implemented yet');
        }
    }
    return images;
}
function applyAxisSizesToBoard(axisGroups, axisDirection) {
    switch (axisDirection) {
        case 'x':
            ImageList.style.width = distanceAround + calcSizeOfAxisGroups(axisGroups) + distanceAround + "px";
            break;
        case 'y':
            ImageList.style.height = distanceAround + calcSizeOfAxisGroups(axisGroups) + distanceAround + "px";
            break;
        default:
            throw Error('Apply axis sizes to board not possible on ' + axisDirection);
    }
}
function calcSizeOfAxisGroups(axisGroups) {
    let totalSize = 0;

    axisGroups.forEach(group => {
       totalSize += group.size;
    });

    return totalSize * sizeMultiplier;
}
function calcAbsolutePositionOfImage(image, axisGroups, axisId) {
    let absoluteSize = 0;
    for (let i = 0; i < axisGroups.length; i++) {
        if (axises[axisId].name === 'age') {
            if (axisGroups[i].name === image.age) {
                break;
            }
        } else if (axises[axisId].name === 'size') {
            if (axisGroups[i].name === calcVolumeOfImage(image)) {
                break;
            }
        } else {
            throw new Error('calcAbsolutePositionOfImage: Axis ' + axises[axisId].name + ' not implemented yet.');
        }
        absoluteSize += axisGroups[i].size;
    }
    return distanceAround + (absoluteSize * sizeMultiplier);
}
function createAxisGroups(images, axisDirection, axisId) {
    let axisGroups = [];
    images.forEach(img => {
        if (axises[axisId].name === 'age') {
            if (axisGroupExists(axisGroups, img.age)) {
                axisGroups = updateAxisGroupSizeIfNecessary(axisGroups, img, axisId);
            } else {
                axisGroups.push(createAxisGroup(img.age, axisDirection === 'x' ? img.width : img.height));
            }
        } else if(axises[axisId].name === 'size') {
            if (axisGroupExists(axisGroups, calcVolumeOfImage(img))) {
                axisGroups = updateAxisGroupSizeIfNecessary(axisGroups, img, axisId);
            } else {
                axisGroups.push(createAxisGroup(calcVolumeOfImage(img), axisDirection === 'x' ? img.width : img.height));
            }
        } else {
            throw new Error('createAxisGroups: xAxis not implemented.');
        }
    });
    return axisGroups;
}
function axisGroupExists(axisGroups, name) {
    let exists = false;
    for(let i = 0; i < axisGroups.length; i++) {
        if (axisGroups[i].name === name) {
            exists = true;
            break;
        }
    }
    return exists;
}
function createAxisGroup(name, size) {
    return {
        name: name,
        size: size
    };
}
function updateAxisGroupSizeIfNecessary(axisGroups, img, axisId) {
    for(let i = 0; i < axisGroups.length; i++) {
        if (axises[axisId].name === 'age') {
            if (axisGroups[i].name === img.age) {
                if(axisGroups[i].size < img.width) {
                    axisGroups[i].size = img.width;
                    break;
                }
            }
        } else if (axises[axisId].name === 'size') {
            if (axisGroups[i].name === calcVolumeOfImage(img)) {
                if(axisGroups[i].size < img.width) {
                    axisGroups[i].size = img.width;
                    break;
                }
            }
        }
    }
    return axisGroups;
}
function calcVolumeOfImage(img) {
    return img.height * img.width;
}
function remapImages() {
    let images = initImages();

    images.forEach(img => {
        let elem = document.getElementById(img.path);
        elem.setAttribute("height", sizeMultiplier * img.height);
        elem.setAttribute("width", sizeMultiplier * img.width);
        elem.style.left = img.posX + "px"
        elem.style.top = img.posY + "px"
    });
}

// hud functions
function initAxises() {
    let axisItemPosX = 0;
    axises[0].groups.forEach(group => {
        let elem = document.createElement("div");
        elem.setAttribute("id", group.name);
        elem.innerText = group.name;
        elem.style.top = "50px";
        elem.style.left = sizeMultiplier * axisItemPosX + "px";
        XAxis.append(elem);
        axisItemPosX += group.size;
    });

    let axisItemPosY = 0;
    axises[1].groups.forEach(group => {
        let elem = document.createElement("div");
        elem.setAttribute("id", group.name);
        elem.innerText = group.name;
        elem.style.left = "50px";
        elem.style.top = sizeMultiplier * axisItemPosY + "px";
        YAxis.append(elem);
        axisItemPosY += group.size;
    });
    updateAxises();
}
function updateAxises() {
    let axisItemPosX = 0;
    axises[0].groups.forEach(group => {
        let elem = document.getElementById(group.name);
        elem.style.top = "50px";
        let left = distanceAround + (sizeMultiplier * axisItemPosX) - currentScrollX;
        elem.style.left = left + "px";
        if (left < vw(10) || left > vw(90) - elem.offsetWidth) {
            elem.style.opacity = "0";
        } else {
            elem.style.opacity = "1";
        }
        axisItemPosX += group.size;
    });

    let axisItemPosY = 0;
    axises[1].groups.forEach(group => {
        let elem = document.getElementById(group.name);
        elem.style.left = "10px";
        let top = distanceAround + (sizeMultiplier * axisItemPosY) - currentScrollY;
        elem.style.top = top + "px";
        if (top < vh(10) || top > vh(90) - elem.offsetHeight) {
            elem.style.opacity = "0";
        } else {
            elem.style.opacity = "1";
        }
        axisItemPosY += group.size;
    });
}
function zoomIn() {
    //currentScrollX /= zoomSpeed;
    //currentScrollY /= zoomSpeed;

    if (sizeMultiplier < maxZoom) {
      sizeMultiplier *= zoomSpeed;
    }

    remapImages();
    updateAxises();
}
function zoomOut() {
    //currentScrollX *= zoomSpeed;
    //currentScrollY *= zoomSpeed;

    if (sizeMultiplier > minZoom) {
        sizeMultiplier /= zoomSpeed;
    }

    remapImages();
    updateAxises();
}

function doubleClick() {
    reorder();
}
function keyDown(event) {
    if(event.key === 'ArrowRight') {
        zoomIn();
    }

    if(event.key === 'ArrowLeft') {
        zoomOut();
    }
}
function reorder() {

    let i = getRandomInt(2);
    if(axises[i].sort === 'up') {
        axises[i].sort = 'down';
    } else {
        axises[i].sort = 'up';
    }
    remapImages();
    updateAxises();
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
let lastScroll = 0;
function scroll(event) {
    document.documentElement.scrollTop = currentScrollY + (event.clientY - (window.innerHeight / 2));
    document.documentElement.scrollLeft = currentScrollX + (event.clientX - (window.innerWidth / 2));

    event.preventDefault();
    if (event.deltaY > 0) {
        zoomOut();
    } else {
        zoomIn();
    }

    updateAxises();
    setCurrentScroll();
    lastScroll = event.deltaY;
}
function vh(v) {
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (v * h) / 100;
}
function vw(v) {
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (v * w) / 100;
}

let pos = { top: 0, left: 0, x: 0, y: 0 };
const mouseDownHandler = function(e) {
    ImageList.style.cursor = 'grabbing';
    ImageList.style.userSelect = 'none';
    pos = {
        // The current scroll
        left: currentScrollX,
        top: currentScrollY,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};
const mouseUpHandler = function() {
    ImageList.style.cursor = 'grab';
    ImageList.style.removeProperty('user-select');

    document.removeEventListener("mousemove", mouseMoveHandler, { passive: true });
    document.removeEventListener("mouseup", mouseUpHandler, { passive: true });
};
const mouseMoveHandler = function(e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;
    // Scroll the element
    document.documentElement.scrollTop = pos.top - dy;
    document.documentElement.scrollLeft = pos.left - dx;
    setCurrentScroll();
    updateAxises();
};

function setCurrentScroll() {
    currentScrollX = (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0);
    currentScrollY = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0);
}