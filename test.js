const expect = require('chai').expect;
const filepix = require(".");
const fs = require('fs');
const request = require('request');
const rimraf = require('rimraf');

const mainTestDir = './test/';
const inputDir = './input/';
const outputDir = './output/';


async function download(url, dest) {
    const file = fs.createWriteStream(dest);
    await new Promise((resolve, reject) => {
        request({
            uri: url,
            gzip: true,
        })
            .pipe(file)
            .on('finish', async () => {
                console.log(`The file is finished downloading.`);
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    })
        .catch((error) => {
            console.log(`Something happened: ${error}`);
        });
}

describe('test converting pdf into images" ', () => {
    it('fetching test PDF', async () => {
        if (!fs.existsSync(mainTestDir)) {
            fs.mkdirSync(mainTestDir);
        }
        if (!fs.existsSync(mainTestDir + inputDir)) {
            fs.mkdirSync(mainTestDir + inputDir);
        }
        if (!fs.existsSync(mainTestDir + outputDir)) {
            fs.mkdirSync(mainTestDir + outputDir);
        }

        await download('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', mainTestDir + inputDir + 'dummy.pdf');
        //make sure that we have healthy pdf for test
        expect(fs.statSync(mainTestDir + inputDir + 'dummy.pdf').size).to.equal(13264);

    }).timeout(4000);

    it('basic usage convert pdf into images', async () => {
        await filepix.PDF2img(mainTestDir + 'input/dummy.pdf', mainTestDir + 'output/');
        const timeAfterConvert = new Date();

        expect(fs.readFileSync(mainTestDir + 'output/0.png')).to.exist;

        const outputResult = fs.statSync(mainTestDir + 'output/0.png');

        expect(outputResult.blksize).to.equal(4096);
        expect(outputResult.birthtime).to.lessThan(timeAfterConvert);
    }).timeout(5000);

    it('add watermark after converting into images', async () => {

        await download('https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png', mainTestDir + inputDir + 'test.png');
        await filepix.PDF2img(mainTestDir + 'input/dummy.pdf', mainTestDir + './', options = {
            watermark: {
                type: 'image',
                path: mainTestDir + inputDir + 'test.png',
                ratio: 0.2,
                opacity: 0.2,
                position: 'left-bottom'
            }
        }
        );
        const timeAfterConvert = new Date();

        expect(fs.readFileSync(mainTestDir + 'output/0.png')).to.exist;

        const outputResult = fs.statSync(mainTestDir + 'output/0.png');

        expect(outputResult.blksize).to.equal(4096);
        expect(outputResult.birthtime).to.lessThan(timeAfterConvert);
        if (mainTestDir) {
            rimraf.sync(mainTestDir);
        }
    }).timeout(5000);
});

describe('test converting images into pdf', () => {
    it('creating test image', async () => {
        if (!fs.existsSync(mainTestDir)) {
            fs.mkdirSync(mainTestDir);
        }
        if (!fs.existsSync(mainTestDir + inputDir)) {
            fs.mkdirSync(mainTestDir + inputDir);
        }
        if (!fs.existsSync(mainTestDir + outputDir)) {
            fs.mkdirSync(mainTestDir + outputDir);
        }

        await download('https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png', mainTestDir + inputDir + 'test.png');
        expect(fs.statSync(mainTestDir + inputDir + 'test.png').size).to.equal(18453);

    }).timeout(3000);

    it('testing convert images to pdf', async () => {
        await filepix.img2PDF(pages = [
            mainTestDir + 'input/test.png',
        ], mainTestDir + 'output/myPDF.pdf');
        setTimeout(() => {
            const timeAfterConvert = new Date();
            expect(fs.readFileSync(mainTestDir + 'output/myPDF.pdf')).to.exist;
            expect(fs.statSync(mainTestDir + 'output/myPDF.pdf').size).to.equal(17908);
            if (mainTestDir) {
                rimraf.sync(mainTestDir);
            }
        }, 2000);
    })
});