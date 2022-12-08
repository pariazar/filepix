const tesseract = require("node-tesseract-ocr");


exports.extractText = async (input, options = {
    lang: "eng",
    oem: 1,
    psm: 3,
}) => {
    options.oem = 1;
    options.psm = 3;
    return await tesseract
        .recognize(input, options)
        .then((text) => {
            return text;
        })
        .catch((error) => {
            console.log(error.message)
        })
};