function getImages() {
    let images = [];

    images.push(createImageObject(1,'ichbinich-1.jpg', 60, 60, getRandYear(), 1, calcGroupName(1), 'Hoffnung'))
    images.push(createImageObject(2,'ichbinich-2.jpg', 50, 70, getRandYear(), 1, calcGroupName(1),'Schmetterlinge'))
    images.push(createImageObject(3,'ichbinich-3.jpg', 50, 70, getRandYear(), 2, calcGroupName(2),'Weisse Weihnacht'))
    images.push(createImageObject(4,'ichbinich-4.jpg', 60, 60, getRandYear(), 2, calcGroupName(2),'Idylle'))
    images.push(createImageObject(5,'ichbinich-5.jpg', 30, 30, getRandYear(), 3, calcGroupName(3),'Lift ins Ungewisse'))
    images.push(createImageObject(6,'ichbinich-6.jpg', 40, 120, getRandYear(), 3, calcGroupName(3),'Jetzt'))
    images.push(createImageObject(7,'ichbinich-7.jpg', 30, 100, getRandYear(), 4, calcGroupName(4),'Anfang'))
    images.push(createImageObject(8,'ichbinich-8.jpg', 30, 30, getRandYear(), 5, calcGroupName(5),'Wohin'))
    images.push(createImageObject(9,'ichbinich-9.jpg', 30, 30, getRandYear(), 6, calcGroupName(6),'Vorhang'))
    images.push(createImageObject(10,'ichbinich-10.jpg', 80, 120, getRandYear(), 6, calcGroupName(6),'Lebenseinstellung'))
    images.push(createImageObject(11,'ichbinich-12.jpg', 60, 50, getRandYear(), 7, calcGroupName(7), 'Freiheit'))
    images.push(createImageObject(12,'ichbinich-15.jpg', 60, 80, getRandYear(), 8, calcGroupName(8), 'Time'))
    images.push(createImageObject(13,'ichbinich-16.jpg', 50, 100, getRandYear(), 8, calcGroupName(8),'Atmen'))
    images.push(createImageObject(14,'ichbinich-18.jpg', 40, 40, getRandYear(), 9, calcGroupName(9),'Meer'))
    images.push(createImageObject(15,'ichbinich-19.jpg', 80, 80, getRandYear(), 9, calcGroupName(9),'Kinder'))
    images.push(createImageObject(16,'ichbinich-20.jpg', 60, 60, getRandYear(), 10, calcGroupName(10),'ich'))

    /*
    images.push(createImageObject(17,'ichbinich-1.jpg', 60, 60, getRandYear(), 'Hoffnung'))
    images.push(createImageObject(18,'ichbinich-2.jpg', 50, 70, getRandYear(), 'Schmetterlinge'))
    images.push(createImageObject(19,'ichbinich-3.jpg', 50, 70, getRandYear(), 'Weisse Weihnacht'))
    images.push(createImageObject(20,'ichbinich-4.jpg', 60, 60, getRandYear(), 'Idylle'))
    images.push(createImageObject(21,'ichbinich-5.jpg', 30, 30, getRandYear(), 'Lift ins Ungewisse'))
    images.push(createImageObject(22,'ichbinich-6.jpg', 40, 120, getRandYear(), 'Jetzt'))
    images.push(createImageObject(23,'ichbinich-7.jpg', 30, 100, 2020, 'Anfang'))
    images.push(createImageObject(24,'ichbinich-8.jpg', 30, 30, getRandYear(), 'Wohin'))
    images.push(createImageObject(25,'ichbinich-9.jpg', 30, 30, getRandYear(), 'Vorhang'))
    images.push(createImageObject(26,'ichbinich-10.jpg', 80, 120, getRandYear(), 'Lebenseinstellung'))
    images.push(createImageObject(27,'ichbinich-12.jpg', 60, 50, getRandYear(), 'Freiheit'))
    images.push(createImageObject(28,'ichbinich-15.jpg', 60, 80, getRandYear(), 'Time'))
    images.push(createImageObject(29,'ichbinich-16.jpg', 50, 100, getRandYear(), 'Atmen'))
    images.push(createImageObject(30,'ichbinich-18.jpg', 40, 40, getRandYear(), 'Meer'))
    images.push(createImageObject(31,'ichbinich-19.jpg', 80, 80, getRandYear(), 'Kinder'))
    images.push(createImageObject(32,'ichbinich-20.jpg', 60, 60, getRandYear(), 'ich'))
*/
    return images;
}
function calcGroupName(id) {
    return "Group " + id;
}

function createImageObject(id, path, height, width, age, group, groupName, name) {
    return {
        id: id,
        path: path,
        height: height,
        width: width,
        age: age,
        group: group,
        groupName: groupName,
        name: name
    };
}
function getRandYear() {
    return 2005 + Math.floor(Math.random() * 15);
}