let ImageList = document.getElementById('images');

loadImages();

function loadImages() {
    let images = getImages();

    let promises = getPalettesForImages(images);

    Promise.all(promises)
        .then(() => {
        let gridColumnsSize = getGridColumnsSize(images);
        let gridRowsSize = getGridRowsSize(images);

        ImageList.style.gridTemplateColumns = 'repeat(' + (2 * gridColumnsSize) + ', auto)';
        ImageList.style.gridTemplateRows = 'repeat(' + (2 * gridRowsSize) + ', auto)';

        images.forEach(img => {
            let imageGridColumns = ((img.width / 10));
            let imageGridRows = ((img.height / 10));

            let div = document.createElement("div");
            div.className = 'list-item';
            div.style.gridColumn = 'span ' + imageGridColumns;
            div.style.gridRow = 'span ' + imageGridRows;

            let divColors = document.createElement("div");
            divColors.className = 'colors';

            let divDarkMuted = document.createElement("div");
            divDarkMuted.className = 'color';
            divDarkMuted.style.background = img.palette.DarkMuted?.hex;
            divColors.append(divDarkMuted);

            let divDarkVibrant = document.createElement("div");
            divDarkVibrant.className = 'color';
            divDarkVibrant.style.background = img.palette.DarkVibrant?.hex;
            divColors.append(divDarkVibrant);

            let divLightMuted = document.createElement("div");
            divLightMuted.className = 'color';
            divLightMuted.style.background = img.palette.LightMuted?.hex;
            divColors.append(divLightMuted);

            let divLightVibrant = document.createElement("div");
            divLightVibrant.className = 'color';
            divLightVibrant.style.background = img.palette.LightVibrant?.hex;
            divColors.append(divLightVibrant);

            let divMuted = document.createElement("div");
            divMuted.className = 'color';
            divMuted.style.background = img.palette.Muted?.hex;
            divColors.append(divMuted);

            let divVibrant = document.createElement("div");
            divVibrant.className = 'color';
            divVibrant.style.background = img.palette.Vibrant?.hex;
            divColors.append(divVibrant);

            div.append(divColors);

            let elem = document.createElement("img");
            elem.setAttribute("src", "./images/" + img.path);
            elem.setAttribute("id", img.path);
            div.append(elem);
            ImageList.append(div);
        });
    });
}

function getGridRowsSize(images) {
    let rowSize = 0;
    images.forEach(img => {
        let currentSize = img.height / 10;
        if(rowSize < currentSize) {
            rowSize = currentSize;
        }
    });
    return rowSize;
}
function getGridColumnsSize(images) {
    let rowSize = 0;
    images.forEach(img => {
        let currentSize = img.width / 10;
        if(rowSize < currentSize) {
            rowSize = currentSize;
        }
    });
    return rowSize;
}

function detectPaletteFromImage(img) {
    return new Promise((resolve, reject) => {
        Vibrant.from("./images/" + img.path).getPalette()
            .then((palette) => {
                resolve(palette);
            })
            .catch(err => {
                reject(err);
            });
    });
}
function getPalettesForImages(images) {
    let promises = [];

    images.forEach(img => {
        promises.push(new Promise((resolve, reject) => {
            detectPaletteFromImage(img)
                .then(palette => {
                    images.find(x => x.path === img.path).palette = palette;
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        }));
    });

    return promises;
}