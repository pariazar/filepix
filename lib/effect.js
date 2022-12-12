const jimp = require('jimp');

exports.readFile = async (filePath) => {
    return await jimp.read(filePath);
}
exports.setEffectBlur = async (image, value) => {
    return image.blur(value);
}

exports.setEffectHue = async (image, value = { apply: 'red', params: [100] }) => {
    return image.color([value]);
}

exports.setEffectBlur = async (image, value) => {
    return image.brightness(0.1);
}

exports.writeFile = async (image, filePath) => {
    await image.writeAsync(filePath);
}

exports.addEffects = async (pages, options) => {
    for (const page of pages) {
        if (options.effects && Array.isArray(options.effects)) {
            const image = await jimp.read(page);
            for (const effect of options.effects) {
                if (effect.name === 'color' && effect.config) {
                    image.color(effect.config);
                }
                if (effect.name === 'blur' && effect.config?.pixels) {
                    image.blur(effect.config.pixels);
                }
                if (effect.name === 'mirror') {
                    image.mirror(true, false);
                }
                if (effect.name === 'flip') {
                    if (effect.config?.horizontal) {
                        image.flip(true, false);
                    }
                    else if (effect.config?.vertical) {
                        image.flip(false, true);
                    }
                }
                if (effect.name === 'contain') {
                    image.contain(options.config[0], options.config[1]);
                }
                if (effect.name === 'cover') {
                    image.cover(options.config[0], options.config[1]);
                }
                if (effect.name === 'rotate') {
                    image.rotate(effect.config?.ratio);
                }
                if (effect.name === 'shadow') {
                    image.shadow();
                }
                if (effect.name === 'brightness') {
                    image.brightness(effect.config?.ratio);
                }
                if (effect.name === 'contrast') {
                    image.contrast(effect.config?.ratio);
                }
                if (effect.name === 'gaussian') {
                    image.gaussian(effect.config?.ratio);
                }
                if (effect.name === 'posterize') {
                    image.posterize(effect.config?.ratio);
                }
                if (effect.name === 'opacity') {
                    image.opacity(effect.config?.ratio);
                }
                if (effect.name === 'sepia') {
                    image.sepia();
                }
                if (effect.name === 'quality') {
                    image.quality(effect.config?.ratio);
                }
                if (effect.name === 'fade') {
                    image.fade(effect.config?.ratio);
                }
                if (effect.name === 'pixelate') {
                    image.pixelate(effect.config?.ratio);
                }
                if (effect.name === 'normalize') {
                    image.normalize();
                }
                if (effect.name === 'threshold') {
                    image.threshold(effect.config);
                }

            }
            await image.writeAsync(page);
        }
    }
}