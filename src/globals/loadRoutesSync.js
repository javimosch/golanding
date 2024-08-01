/**
 * Synchronously loads all .js files in the specified directory in alphanumeric order.
 *
 */
function loadRoutesSync(app,relativePath = 'routes') {
    const fs = require('fs');
    const path = require('path');
    const routesDir = path.join(process.cwd(), 'src', relativePath);

    // Get all .js files in the directory
    const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

    // Sort the files alphanumerically
    files.sort((a, b) => {
        const aNum = a.match(/(\d+)/);
        const bNum = b.match(/(\d+)/);
        if (aNum && bNum) {
            return parseInt(aNum[0]) - parseInt(bNum[0]) || a.localeCompare(b);
        }
        return a.localeCompare(b);
    });

    // Load and execute each file
    files.forEach(file => {
        const filePath = path.join(routesDir, file);
        const mod = require(filePath);
        
        if (typeof mod !== 'function') {
            throw new Error(`module.exports should be a function! (At: ${filePath})`);
        }

        try {
            mod(app);
        } catch (err) {
            console.error({ err });
            throw new Error(`Failed to load route (At: ${filePath})`);
        }
        console.log(`(${relativePath}) ${file} loaded`);
    });
}

module.exports = loadRoutesSync;