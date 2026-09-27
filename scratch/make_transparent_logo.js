const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processLogo() {
    const inputPath = path.join(__dirname, '../public/images/logo-dark.png');
    if (!fs.existsSync(inputPath)) {
        console.error('File not found:', inputPath);
        return;
    }

    const { data, info } = await sharp(inputPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    console.log(`Image info: ${width}x${height}, channels: ${channels}`);

    // Inspect the background color by sampling the top-left pixels
    // If background is white or light cream (R > 230, G > 220, B > 210), turn alpha to 0 with a smooth feather
    const outBuffer = Buffer.from(data);

    for (let i = 0; i < outBuffer.length; i += channels) {
        const r = outBuffer[i];
        const g = outBuffer[i + 1];
        const b = outBuffer[i + 2];

        // Detect white / off-white background
        // The logo text is deep maroon (#3A0813, R~58, G~8, B~19)
        // Background is white / light cream (R > 225, G > 220, B > 215)
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        if (r > 210 && g > 200 && b > 190) {
            // Background - calculate smooth alpha
            if (r > 240 && g > 235 && b > 230) {
                outBuffer[i + 3] = 0; // Fully transparent
            } else {
                // Anti-aliased edge smoothing
                const factor = Math.max(0, Math.min(1, (240 - brightness) / 40));
                outBuffer[i + 3] = Math.round(factor * 255);
            }
        }
    }

    // Save transparent PNG
    const transparentLogoPath = path.join(__dirname, '../public/images/logo-transparent.png');
    const destLogoDark = path.join(__dirname, '../public/images/logo-dark.png');
    const destLogo = path.join(__dirname, '../public/images/logo.png');

    await sharp(outBuffer, {
        raw: {
            width,
            height,
            channels
        }
    })
    .trim({ threshold: 5 }) // trim excess transparent margins
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(transparentLogoPath);

    console.log('Saved transparent logo to:', transparentLogoPath);

    // Overwrite logo.png and logo-dark.png with the transparent version
    fs.copyFileSync(transparentLogoPath, destLogoDark);
    fs.copyFileSync(transparentLogoPath, destLogo);
    console.log('Updated logo-dark.png and logo.png');
}

processLogo().catch(console.error);
