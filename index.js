const fs = require('fs');
const rimraf = require('rimraf');
const sizes = require('./files/sizes.json');
const pdf2img = require('./modules/pdf2img');
const convertPDF = require('./modules/img2pdf');
const watermark = require('./modules/watermark');
const effect = require('./modules/effect');
const ocr = require('./modules/ocr');
const wordMaker = require('./modules/wordMaker');
const pngToJpeg = require('./modules/convertImg');
const base64ToImage = require('./modules/base642img');



function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

exports.sizes = require('./files/sizes.json');

exports.png2jpeg = async (input, output, options) => {
    let buffer = fs.readFileSync(input);
    pngToJpeg({ quality: options.quality })(buffer)
        .then(output => fs.writeFileSync(output, output));
}

exports.hasModification = async (options) => {
    if (options.watermarkText || options.watermarkPosition || options.compress) {
        return true;
    }
    else {
        return false;
    }
}
exports.makePages = async (input, output, options) => {
    const allPages = [];
    const mainPath = input.split('/');
    mainPath.pop();

    //create temp directory
    const dir = mainPath.join('/') + '/tmp/'

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const pdf2imgResult = pdf2img.convert(input, options);
    pdf2imgResult.then(async function (pdfArray) {
        for (i = 0; i < pdfArray.length; i++) {

            const filePath = dir + i + "." + (options.extension ? options.extension : 'png');

            fs.writeFile(filePath, pdfArray[i], async (error) => {
                if (error) {
                    console.error("Error: " + error);
                }
            });

            const page = await ocr.extractText(filePath, options);
            allPages.push(page);
            if (pdfArray.length - 1 === i) {
                wordMaker.convertTextToDocs(allPages.join('\n'), output, options)
                if (dir) {
                    rimraf.sync(dir);
                }
            }
        }
    });
    return allPages;
}
exports.pdf2docx = async (input, output, options = {}) => {
    const pages = await this.makePages(input, output, options);
}
// This returns a promise as it's an async function
exports.PDF2img = async (input, output, options) => {
    var output = pdf2img.convert(input, options);
    // Acting on this promise when it's fulfilled:
    const pages = [];
    output.then(async function (pdfArray) {
        console.log("Saving");
        // Loop through each page, saving the images
        for (i = 0; i < pdfArray.length; i++) {
            const filePath = output + i + "." + (options.extension ? options.extension : 'png');
            console.log(filePath);
            fs.writeFile(filePath, pdfArray[i], (error) => {
                if (error) { console.error("Error: " + error); }

            }); //writeFile
            // if (options.compress) {

            // }
            pages.push(filePath);

        }
        console.log(pages);
        await watermark.addWatermarks(pages, options);
        await effect.addEffects(pages, options);

    });

}

exports.img2PDF = async (pages = [], output, options = { size: sizes.A4 }) => {
    const mainDir = pages;
    let dir;
    const modifiedPages = [];

    if (typeof pages === 'string') {
        //get list of files inside directory
        pages = getFiles(pages).map((page) => String(page));
        //transfer files to temp directory for extra modification
        if (pages.length > 0 && this.hasModification(options)) {
            dir = mainDir + '/tmp/';
            pages.map((page) => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                const tempPath = dir + page.split('/').slice(-1).pop();
                modifiedPages.push(tempPath);
                fs.copyFileSync(page, tempPath)
            });
        }
        await watermark.addWatermarks(modifiedPages, options);
        await effect.addEffects(modifiedPages, options);
        convertPDF(modifiedPages, options.size)
            .pipe(fs.createWriteStream(output));
        if (dir) {
            rimraf.sync(dir);
        }
    }
    else if (pages && pages.length > 0) {
        //transfer files to temp directory for extra modification
        if (pages.length > 0 && this.hasModification(options)) {
            dir = './tmp/';
            pages.map((page) => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                const tempPath = dir + page.split('/').slice(-1).pop();
                modifiedPages.push(tempPath);
                fs.copyFileSync(page, tempPath)
            });
        }
        await watermark.addWatermarks(pages, options);
        await effect.addEffects(pages, options);
        convertPDF(pages, options.size).pipe(fs.createWriteStream(output));
        if (dir) {
            rimraf.sync(dir);
        }
    }

}

exports.base64ToImg = async (input, output, options) => {
    const fileName = output.split('/').slice(-1).pop();
    const finalPath = output.split('/');
    finalPath.pop();

    var path = finalPath.join('/');
    var optionalObj = { 'fileName': fileName, 'type': options.extension || 'png' };

    base64ToImage(input, path, optionalObj);
}

exports.addEffectToPDF = async (input, output, options) => {
    const dir = './tmp2/'
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    await this.PDF2img(input, dir, options);
    await this.img2PDF(dir, output);
    if (dir) {
        rimraf.sync(dir);
    }
};