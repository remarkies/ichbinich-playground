function getPalettes(images) {
    let promises = [];

    images.forEach(img => {
        promises.push(new Promise((resolve, reject) => {
            detectPalette(img)
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

function detectPalette(img) {
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