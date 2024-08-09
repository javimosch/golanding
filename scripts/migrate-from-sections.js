require('dotenv').config();
const express = require("express");
const app = express();
const path = require('path')
require(path.join(process.cwd(), 'src','globals','injectGlobals.js'))(path.join(process.cwd(), 'src','globals'));
global.loadRoutesSync(app, "middlewares", {
  blacklistPartial: (process.env.MIDDLEWARE_BLACKLIST_PARTIAL || "").split(","),
});
global.loadModelsSync(require('path').join(process.cwd(),'src', 'models'));

/**
 * Goal: sections are deprecated. Move html into single html field
 */
async function migrationFunction() {
  try {
    const { LandingPage } = global.getMongooseModels(["LandingPage"]);

    // Fetch all landing pages
    const landingPages = await LandingPage.find({});

    for (const page of landingPages) {
      // Combine all sections into a single HTML string
      const combinedHtml = page.sections.join("\n");

      // Update the html field with the combined content
      page.html = combinedHtml;

      // Save the updated document
      await page.save();

      console.log(`Updated landing page: ${page.name}`);
    }

    console.log("Migration completed successfully");
    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
migrationFunction();
