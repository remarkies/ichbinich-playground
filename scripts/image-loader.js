function getImages() {
    let images = [];

    images.push(createImageObject('ichbinich-1.jpg', 60, 60, 2005))
    images.push(createImageObject('ichbinich-2.jpg', 50, 70, 2012))
    images.push(createImageObject('ichbinich-3.jpg', 50, 70, 2007))
    images.push(createImageObject('ichbinich-4.jpg', 60, 60, 2008))
    images.push(createImageObject('ichbinich-5.jpg', 30, 30, 2009))
    images.push(createImageObject('ichbinich-6.jpg', 40, 120, 2010))
    images.push(createImageObject('ichbinich-7.jpg', 30, 100, 2010))
    images.push(createImageObject('ichbinich-8.jpg', 30, 30, 2011))
    images.push(createImageObject('ichbinich-9.jpg', 30, 30, 2012))
    images.push(createImageObject('ichbinich-10.jpg', 80, 120, 2013))
    images.push(createImageObject('ichbinich-12.jpg', 60, 50, 2014))
    images.push(createImageObject('ichbinich-15.jpg', 60, 80, 2013))
    images.push(createImageObject('ichbinich-16.jpg', 50, 100, 2018))
    images.push(createImageObject('ichbinich-18.jpg', 40, 40, 2020))
    images.push(createImageObject('ichbinich-19.jpg', 80, 80, 2009))

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
function getRandYear() {
    return 2005 + Math.floor(Math.random() * 15);
}