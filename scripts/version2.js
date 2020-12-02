let ImageList = document.getElementById('images');

loadImages();

function loadImages() {
    let images = getImages();
    let gridColumnsSize = getGridColumnsSize(images);
    let gridRowsSize = getGridRowsSize(images);

    ImageList.style.gridTemplateColumns = 'repeat(' + (2 * gridColumnsSize) + ', auto)';
    ImageList.style.gridTemplateRows = 'repeat(' + (2 * gridRowsSize) + ', auto)';
    images.forEach(img => {
        let imageGridColumns = ((img.width / 10));
        let imageGridRows = ((img.height / 10));

        //console.log(img.path, imageGridColumns, imageGridRows)

        let div = document.createElement("div");
        div.className = 'list-item';
        div.style.gridColumn = 'span ' + imageGridColumns;
        div.style.gridRow = 'span ' + imageGridRows;

        let elem = document.createElement("img");
        elem.setAttribute("src", "./images/" + img.path);
        elem.setAttribute("id", img.path);
        div.append(elem);
        ImageList.append(div);
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