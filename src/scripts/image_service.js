let ImageList = document.getElementById('image-list');
let XAxis = document.getElementById('x-Axis');
window.addEventListener("scroll", scroll);
ImageList.addEventListener('dblclick', zoomIn);
let distanceAround = vh(20);
let sizeMultiplier = 2;
let zoomSpeed = 1.2;
let maxZoomIn = 0.1;
let currentScrollX = 0;
let currentScrollY = 0;

let axises = [
    { name: 'age', direction: 'x', sort: 'down', groups: [] },
    { name: 'size', direction: 'y', sort: 'up', groups: [] }
];

loadImages();
initAxises();

// image functions
function loadImages() {
    let images = initImages();
    images.forEach(img => {
        let elem = document.createElement("img");
        elem.setAttribute("src", "../public/images/" + img.path);
        elem.setAttribute("height", sizeMultiplier * img.height);
        elem.setAttribute("width", sizeMultiplier * img.width);
        elem.setAttribute("id", img.path);
        elem.style.left = img.posX + "px";
        elem.style.top = img.posY + "px";
        ImageList.append(elem);
    });

}
function initImages() {
    let images = [];

    images.push(createImageObject('IMG_2786.jpg', 30, 24, 2008))
    images.push(createImageObject('IMG_2787.jpg', 40, 120, 2010))
    images.push(createImageObject('IMG_2788.jpg', 30, 100, 2009))
    images.push(createImageObject('IMG_2789.jpg', 30, 30, 2014))
    images.push(createImageObject('IMG_2790.jpg', 30, 30, 2016))
    images.push(createImageObject('IMG_2791.jpg', 80, 120, 2018))
    images.push(createImageObject('IMG_2792.jpg', 70, 50, 2005))
    images.push(createImageObject('IMG_2793.jpg', 60, 50, 2016))

    images = applyAxisToImages(images, 0);
    images = applyAxisToImages(images, 1);
    return images;
}
function createImageObject(path, height, width, age) {
    return {
       path: path,
       height: height,
       width: width,
        age: age
    };
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
}
function zoomIn() {
    if (sizeMultiplier >= maxZoomIn) {
        sizeMultiplier *= zoomSpeed;
    }
    remapImages();
    updateAxises();
}
function scroll() {
    let doc = document.documentElement;
    currentScrollX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    currentScrollY = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
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
