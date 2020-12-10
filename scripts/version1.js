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
let zoomCorrection = {
    x: 75,
    y: 40
}
let paddingBetweenGroups = 5;
let paddingBetweenImages = 10;
let imageNameZoom = {
    min: 2,
    max: 10
};
let axisSizeDivider = 1;
let lastSelectedLocation = null;
let pos = { top: 0, left: 0, x: 0, y: 0 };

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
    { name: 'size', direction: 'y', sort: 'up', groups: [],
        getValueToCompare(img) { return calcVolumeOfImage(img); } ,
        compare(a,b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) }
    }
    /*
    { name: 'age', direction: 'y', sort: 'down', groups: [],
        getValueToCompare(img) { return img.age; },
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
    disableScroll(scroll);

    images = await getImages();
    calcImages();

    createHtmlImages(images);
    createHtmlAxises();
    draw();
    startLocation();
}

function draw() {
    calcImages();
    handleImageData();
    resizeImages();
    updateAxises();
}

// image functions
function createHtmlImages(images) {
    images.forEach(img => {
        let div = document.createElement("div");
        div.className = 'imageItem';
        div.style.height = (sizeMultiplier * img.height) + 'px';
        div.style.width = (sizeMultiplier * img.width) + 'px';
        div.setAttribute("id", img.id);
        div.style.left = img.posX + "px";
        div.style.top = img.posY + "px";

        let divImageData = document.createElement("div");
        divImageData.className = 'imageData';
        divImageData.setAttribute('id', img.name);
        let divImageName = document.createElement("div");
        divImageName.className = 'imageName';
        divImageName.innerText = img.name;
        divImageData.append(divImageName);

        let divImageDescription = document.createElement("div");
        divImageDescription.className = 'imageDescription';
        divImageDescription.innerText = img.description;
        divImageData.append(divImageDescription);

        div.append(divImageData);
        let elem = document.createElement("img");
        elem.setAttribute("src", "./images/" + img.path);
        div.append(elem);

        ImageList.append(div);
    });
}

// magic stuff happening down here
function calcImages() {
    images = applyAxisToImages(images, 0);
    images = applyAxisToImages(images, 1);
}
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
function resizeImages() {
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
function createHtmlAxises() {
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
}
function updateAxises() {
    let axisItemPosX = 0;
    axises[0].groups.forEach(group => {
        let elem = document.getElementById(group.name);
        elem.style.top = "50px";
        let left = horizontalDistAround + (sizeMultiplier * axisItemPosX) - getCurrentScroll().x;
        elem.style.left = left + "px";
        if (left < vw(5) || left > vw(95) - elem.offsetWidth) {
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
        let top = verticalDistAround + (sizeMultiplier * axisItemPosY) - getCurrentScroll().y;
        elem.style.top = top + "px";
        if (top < vh(5) || top > vh(95) - elem.offsetHeight) {
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
        let scroll = getCurrentScroll()
        setCurrentScroll(scroll.x * zoomSpeed - zoomCorrection.x, scroll.y * zoomSpeed - zoomCorrection.y);
        draw();
    }
}
function zoomOut() {
    if (sizeMultiplier > minZoom) {
        sizeMultiplier /= zoomSpeed;
        let scroll = getCurrentScroll()
        setCurrentScroll(scroll.x / zoomSpeed + zoomCorrection.x, scroll.y / zoomSpeed + zoomCorrection.y);
        draw();
    }
}
function handleImageData() {
    //console.log(sizeMultiplier);
    let imageDatas = document.getElementsByClassName('imageData');
    for(let i = 0; i < imageDatas.length; i++) {
        let imageData = imageDatas[i];

        if(sizeMultiplier > imageNameZoom.min && sizeMultiplier < imageNameZoom.max) {
            imageData.style.display = 'block';
            //imageData.style.marginTop = ((images.filter(o => o.name === imageData.id)[0].height * sizeMultiplier) + 5) + 'px';
            imageData.style.marginLeft = ((images.filter(o => o.name === imageData.id)[0].width * sizeMultiplier) + 24) + 'px';
        } else {
            imageData.style.display = 'none';
        }
    }
}
function setTransitionOfImages(transition) {
    let images = document.getElementsByClassName('imageItem');
    for(let i = 0; i < images.length; i++) {
        images[i].style.transition = transition + 's';
    }
}

function startLocation() {
    let grps = {
      xGroup: axises[0].groups[0],
      yGroup: axises[1].groups[0]
    };
    sizeMultiplier = minZoom;
    draw();
    let loc = locationToScrollTo(grps);
    let horizontalWidth = calcSizeOfAxisGroups(axises[0].groups) / 2;
    let verticalWidth = calcSizeOfAxisGroups(axises[1].groups) / 2;
    loc.left -= vw(45) - (horizontalWidth * sizeMultiplier);
    loc.top -= vh(35) - (verticalWidth * sizeMultiplier);
    setCurrentScroll(loc.left, loc.top);
    draw();
}

// jump to image
function locationSelected(x, y) {
    let grps = getGroupsForLocation(x,y);
    let imgs = getImagesForLocation(grps);

    if (lastSelectedLocation !== null && lastSelectedLocation.grps.xGroup.name === grps.xGroup.name &&
        lastSelectedLocation.grps.yGroup.name === grps.yGroup.name) {
        sizeMultiplier = lastSelectedLocation.sizeMultiplier;
        draw();
        setCurrentScroll(lastSelectedLocation.scroll.x, lastSelectedLocation.scroll.y);
        draw();
        lastSelectedLocation = null;
    } else {
        lastSelectedLocation = {
            sizeMultiplier: sizeMultiplier,
            scroll: getCurrentScroll(),
            grps: grps
        };

        if (imgs.length > 0) {
            let img = imgs[0];
            sizeMultiplier = maxZoom;
            draw();
            let loc = locationToScrollTo(grps);
            loc.left -= vw(50) - ((img.width / 2) * sizeMultiplier);
            loc.top -= vh(50) - ((img.height / 2) * sizeMultiplier);
            setCurrentScroll(loc.left, loc.top);
            draw();
        }
    }
}
function locationToScrollTo(grps) {
    let left = 0;
    let top = 0;
    let axisItemPosX = 0;
    let axisItemPosY = 0;

    axises[0].groups.forEach(group => {
        if (group.name === grps.xGroup.name) {
            left = horizontalDistAround + (sizeMultiplier * axisItemPosX);
        }

        axisItemPosX += group.size;

    });

    axises[1].groups.forEach(group => {
        if (group.name === grps.yGroup.name) {
            top = verticalDistAround + (sizeMultiplier * axisItemPosY);
        }

        axisItemPosY += group.size;
    });

    return {
        left: left,
        top: top
    };
}
function getGroupsForLocation(x, y) {
    let axisItemPosX = 0;
    let axisItemPosY = 0;
    let xGroup = null;
    let yGroup = null;

    axises[0].groups.forEach(group => {
        let left = horizontalDistAround + (sizeMultiplier * axisItemPosX) - getCurrentScroll().x;
        if (left < x) {
            xGroup = group;
        }
        axisItemPosX += group.size;
    });

    axises[1].groups.forEach(group => {
        let top = verticalDistAround + (sizeMultiplier * axisItemPosY) - getCurrentScroll().y;
        if (top < y) {
            yGroup = group;
        }
        axisItemPosY += group.size;
    });
    console.log(xGroup.name, yGroup.name);
    return {
        xGroup: xGroup,
        yGroup: yGroup
    };
}
function getImagesForLocation(grps) {
    let imgs = [];

    images.forEach(img => {
        if(grps.xGroup.name === axises[0].getValueToCompare(img) && grps.yGroup.name === axises[1].getValueToCompare(img)) {
            imgs.push(img);
        }
    });

    return imgs;
}

// triggers
function doubleClick(event) {


    if(event.clientY < 100) {
        reorder(0);
    } else if(event.clientX < 100) {
        reorder(1)
    } else {
        locationSelected(event.clientX, event.clientY);
    }

}
function keyDown(event) {
    startLocation();
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
    setTransitionOfImages(0);

    draw();
}
function scroll(event) {
    event.preventDefault();
    if (event.deltaY > 0) {
        zoomOut(event);
    } else {
        zoomIn(event);
    }
}
const mouseDownHandler = function(e) {
    ImageList.style.cursor = 'grabbing';
    ImageList.style.userSelect = 'none';
    pos = {
        // The current scroll
        left: getCurrentScroll().x,
        top: getCurrentScroll().y,
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

    moveMouse(dx, dy);
};

function moveMouse(dx, dy) {
    setCurrentScroll(pos.left - dx, pos.top - dy);
    draw();
}

// helpers
function setCurrentScroll(x, y) {
    document.documentElement.scrollLeft = x;
    document.documentElement.scrollTop = y;
}
function getCurrentScroll() {
    return {
        x: document.documentElement.scrollLeft,
        y: document.documentElement.scrollTop
    }
}
function vh(v) {
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (v * h) / 100;
}
function vw(v) {
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (v * w) / 100;
}