let ImageList = document.getElementById('image-list');

window.addEventListener('keydown', keyDown);

ImageList.addEventListener('dblclick', event => doubleClick(event));
ImageList.addEventListener('mousedown', event => mouseDownHandler(event));

let XAxis = document.getElementById('x-Axis');
let YAxis = document.getElementById('y-Axis');

let horizontalDistAround = vw(100);
let verticalDistAround = vh(100);

let sizeMultiplier = 0.5;
let zoomSpeed = 1.07;
let maxZoom = 8;
let minZoom = 0.5;
let currentScrollX = 0;
let currentScrollY = 0;
let paddingBetweenGroups = 5;
let paddingBetweenImages = 10;
let imageNameZoom = {
    min: 2,
    max: 10
};
let axisSizeDivider = 1;


let axises = [
    { name: 'age', direction: 'x', sort: 'down', groups: [],
        getValueToCompare(img) { return img.age; },
        compare(a,b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) }
    },
    { name: 'color', direction: 'y', sort: 'up', groups: [],
        getValueToCompare(img) { return img.palette.DarkVibrant?.hex; } ,
        compare(a,b) {
            var colorA = new Color(a);
            var colorB = new Color(b);
            constructColor(colorA);
            constructColor(colorB);
            return compareColors(colorA, colorB);
        }
    }
    /*
    { name: 'age', direction: 'y', sort: 'down', groups: [],
        getValueToCompare(img) { return img.age; },
        compare(a,b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) }
    }
    { name: 'size', direction: 'y', sort: 'up', groups: [],
        getValueToCompare(img) { return calcVolumeOfImage(img); } ,
        compare(a,b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) }
    }
    { name: 'group', direction: 'y', sort: 'up', groups: [],
        getValueToCompare(img) { return img.groupName; },
        compare(a,b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) }
    },
    */
];
let images = [];
init();
async function init() {
    images = await getImages();
    loadImages();
    handleImageNames();
    initAxises();
    setCurrentScroll();
    disableScroll(scroll);
    //document.documentElement.scrollLeft = horizontalDistAround / 2;
    //document.documentElement.scrollTop = verticalDistAround / 2;
    remapImages();
    updateAxises()
}

// image functions
function loadImages() {
    let images = initImages();
    images.forEach(img => {
        let div = document.createElement("div");
        div.className = 'imageItem';
        div.style.height = (sizeMultiplier * img.height) + 'px';
        div.style.width = (sizeMultiplier * img.width) + 'px';
        div.setAttribute("id", img.id);
        div.style.left = img.posX + "px";
        div.style.top = img.posY + "px";

        let divImageName = document.createElement("div");
        divImageName.className = 'imageName';
        divImageName.innerText = img.name;
        div.append(divImageName);

        let elem = document.createElement("img");
        elem.setAttribute("src", "./images/" + img.path);
        div.append(elem);

        ImageList.append(div);
    });
}
function initImages() {
    images = applyAxisToImages(images, 0);
    images = applyAxisToImages(images, 1);
    return images;
}

// magic stuff happening down here
function applyAxisToImages(images, axisId) {
    axises[axisId].groups = createAxisGroups(images, axises[axisId].direction, axisId);
    switch (axises[axisId].sort) {
        case 'up':
            axises[axisId].groups = axises[axisId].groups.sort((a,b) => axises[axisId].compare(a,b));
            break;
        case 'down':
            axises[axisId].groups = axises[axisId].groups.sort((a,b) => axises[axisId].compare(a,b) * -1);
        default:
            new Error('Sort direction ' + axises[axisId].sort + ' of axis not implemented yet.')
            break;
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
            ImageList.style.width = horizontalDistAround + calcSizeOfAxisGroups(axisGroups) + horizontalDistAround + "px";
            break;
        case 'y':
            ImageList.style.height = verticalDistAround + calcSizeOfAxisGroups(axisGroups) + verticalDistAround + "px";
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
        if(axisGroups[i].name === axises[axisId].getValueToCompare(image)) {
            break;
        }
        absoluteSize += axisGroups[i].size;
    }

    if (axises[axisId].direction === 'x') {
        return horizontalDistAround + (absoluteSize * sizeMultiplier);
    } else if (axises[axisId].direction === 'y') {
        return verticalDistAround + (absoluteSize * sizeMultiplier);
    }
}
function createAxisGroups(images, axisDirection, axisId) {
    let axisGroups = [];
    let axisSize = getBiggestSize(images);
    images.forEach(img => {
        if (axisGroupExists(axisGroups, axises[axisId].getValueToCompare(img))) {
            axisGroups = updateAxisGroupSizeIfNecessary(axisGroups, img, axisId);
        } else {
            axisGroups.push(createAxisGroup(axises[axisId].getValueToCompare(img), paddingBetweenGroups + (axisDirection === 'x' ? axisSize.x : axisSize.y) + paddingBetweenGroups));
            //axisGroups.push(createAxisGroup(img.age, paddingBetweenGroups + (axisDirection === 'x' ? img.width : img.height) + paddingBetweenGroups));
        }
    });
    return axisGroups;
}
function getBiggestSize(images) {
    let biggestSize = { x: 0, y: 0 };
    images.forEach(img => {
        if(img.width > biggestSize.x) {
            biggestSize.x = img.width;
        }
        if(img.height > biggestSize.y) {
            biggestSize.y = img.height;
        }
    });
    biggestSize = { x: biggestSize.x / axisSizeDivider, y: biggestSize.y / axisSizeDivider}

    return biggestSize;
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
        if (axisGroups[i].name === axises[axisId].getValueToCompare(img)) {
            if(axisGroups[i].size - (2 * paddingBetweenGroups) < + img.width) {
                axisGroups[i].size = (2 * paddingBetweenGroups) + img.width;
                break;
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
    let addedImages = [];

    images.forEach(img => {
        let elem = document.getElementById(img.id);
        elem.style.height = (sizeMultiplier * img.height) + 'px';
        elem.style.width = (sizeMultiplier * img.width) + 'px';

        let imagesAtSameSpot = addedImages.filter(o => o.posX === img.posX && o.posY === img.posY);
        elem.style.left = (img.posX + (imagesAtSameSpot.length * paddingBetweenImages * sizeMultiplier)) + "px"
        elem.style.top = (img.posY + (imagesAtSameSpot.length * paddingBetweenImages * sizeMultiplier)) + "px"
        addedImages.push(img);
    });
}

// hud functions
function initAxises() {
    let axisItemPosX = 0;
    axises[0].groups.forEach(group => {
        let elem = document.createElement("div");
        elem.setAttribute("id", group.name);
        elem.className = "axis-group";
        if(axises[0].name === 'color'){
            elem.style.color = group.name;
        }
        elem.style.top = "50px";
        elem.style.left = sizeMultiplier * axisItemPosX + "px";
        let text = document.createElement("p");
        text.textContent = group.name;
        let divider = document.createElement("div");
        divider.className = "divider x-divider";
        elem.append(text);
        elem.append(divider);
        XAxis.append(elem);
        axisItemPosX += group.size;
    });

    let axisItemPosY = 0;
    axises[1].groups.forEach(group => {
        let elem = document.createElement("div");
        elem.setAttribute("id", group.name);
        elem.className = "axis-group";
        if(axises[1].name === 'color'){
            elem.style.color = group.name;
        }
        elem.style.left = "50px";
        elem.style.top = sizeMultiplier * axisItemPosY + "px";
        let text = document.createElement("p");
        text.textContent = group.name;
        let divider = document.createElement("div");
        divider.className = "divider y-divider";
        elem.append(divider);
        elem.append(text)
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
        let left = horizontalDistAround + (sizeMultiplier * axisItemPosX) - currentScrollX;
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
        let top = verticalDistAround + (sizeMultiplier * axisItemPosY) - currentScrollY;
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
    if (sizeMultiplier < maxZoom) {
      sizeMultiplier *= zoomSpeed;
        document.documentElement.scrollTop = (currentScrollY * zoomSpeed) - 20;
        document.documentElement.scrollLeft = (currentScrollX * zoomSpeed) - 15;
    }

    remapImages();
    updateAxises();
}
function zoomOut() {
    if (sizeMultiplier > minZoom) {
        sizeMultiplier /= zoomSpeed;
        document.documentElement.scrollTop = (currentScrollY / zoomSpeed) + 20;
        document.documentElement.scrollLeft = (currentScrollX / zoomSpeed) + 15;
    }

    remapImages();
    updateAxises();
}

function handleImageNames() {
    //console.log(sizeMultiplier);
    let imageNames = document.getElementsByClassName('imageName');
    for(let i = 0; i < imageNames.length; i++) {
        let imageName = imageNames[i];

        if(sizeMultiplier > imageNameZoom.min && sizeMultiplier < imageNameZoom.max) {
            imageName.style.display = 'block';
            imageName.style.marginTop = ((images.filter(o => o.name === imageName.innerText)[0].height * sizeMultiplier) + 5) + 'px';
        } else {
            imageName.style.display = 'none';
        }
    }
}

function setTransitionOfImages(transition) {
    let images = document.getElementsByClassName('imageItem');
    for(let i = 0; i < images.length; i++) {
        images[i].style.transition = transition + 's';
    }
}

function doubleClick(event) {
    if(event.clientY < 100) {
        reorder(0);
    }

    if(event.clientX < 100) {
        reorder(1)
    }

}
function keyDown(event) {
    if(event.key === 'ArrowRight') {
        zoomIn();
    }

    if(event.key === 'ArrowLeft') {
        zoomOut();
    }
}
function reorder(axis) {
    setTransitionOfImages(1);
    if(axises[axis].sort === 'up') {
        axises[axis].sort = 'down';
    } else {
        axises[axis].sort = 'up';
    }
    remapImages();
    updateAxises();
    setTransitionOfImages(0);
}
let lastScroll = 0;
function scroll(event) {
    setCurrentScroll();

    event.preventDefault();
    if (event.deltaY > 0) {
        zoomOut(event);
    } else {
        zoomIn(event);
    }

    handleImageNames();
    lastScroll = event.deltaY;
    setCurrentScroll();
    updateAxises();
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