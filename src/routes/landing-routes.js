// routes/landing-page-routes.js

const express = require("express");
const router = express.Router();
const LandingPage = require("../models/LandingPage");
const errorHandler = require("../utils/errorHandler");
const validate = global.validateSchema;

// Get all landing pages
router.get(
  "/",
  errorHandler(async (req, res) => {
    console.debug("Fetching all landing pages", 4, "routes");
    const landingPages = await LandingPage.find();
    res.json(landingPages);
  })
);

// Get a specific landing page by name
router.get(
  "/:name",
  errorHandler(async (req, res) => {
    const landingPage = await LandingPage.findOne({ name: req.params.name });
    if (!landingPage) {
      await global.logEvent("LANDING_PAGE_FETCH_ONE_NOT_FOUND", {
        name: req.params.name,
      });
      return res.status(404).json({ message: "Landing page not found" });
    }
    //await global.logEvent("LANDING_PAGE_FETCH_ONE", { name: req.params.name });
    res.json(landingPage);
  })
);

// Create a new landing page
router.post(
  "/",
  validate(LandingPage.schema),
  errorHandler(async (req, res) => {
    let payload = {
      metadata: req.body.metadata || {},
      sections: req.body.sections,
      name: req.body.name,
    };
    const landingPage = new LandingPage(payload);

    const newLandingPage = await landingPage.save();
    await global.logEvent("LANDING_PAGE_CREATE", { payload });
    await global.updatePreviewAndLogEvent(landingPage)
    try {
      const deploymentInfo = await global.deployLandingPage(newLandingPage);
      return res
        .status(201)
        .json({ ...newLandingPage.toObject(), deployment: deploymentInfo });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(201).json(newLandingPage);
  })
);

// Update a landing page
router.put(
  "/:name",
  validate(LandingPage.schema),
  errorHandler(async (req, res) => {
    const landingPage = await LandingPage.findOne({ name: req.params.name });
    if (!landingPage) {
      await global.logEvent("LANDING_PAGE_UPDATE_NOT_FOUND", {
        name: req.params.name,
      });
      return res.status(404).json({ message: "Landing page not found" });
    }

    landingPage.metadata = req.body.metadata || {};
    landingPage.sections = req.body.sections;
    landingPage.name = req.body.name;

    const updatedLandingPage = await landingPage.save();
    await global.logEvent("LANDING_PAGE_UPDATE", {
      name: updatedLandingPage.name,
    });

    await global.updatePreviewAndLogEvent(landingPage)

    try {
      const deploymentInfo = await global.deployLandingPage(landingPage);
      return res
        .status(201)
        .json({ ...landingPage.toObject(), deployment: deploymentInfo });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json(updatedLandingPage);
  })
);

// Delete a landing page
router.delete(
  "/:name",
  errorHandler(async (req, res) => {
    const landingPage = await LandingPage.findOneAndDelete({
      name: req.params.name,
    });
    if (!landingPage) {
      await global.logEvent("LANDING_PAGE_DELETE_NOT_FOUND", {
        name: req.params.name,
      });
      return res.status(404).json({ message: "Landing page not found" });
    }
    await global.logEvent("LANDING_PAGE_DELETE_SUCCESS", {
      name: landingPage.name,
    });
    res.json({ message: "Landing page deleted" });
  })
);

// Global variable to store preview data
global.previewLandingPages = {};

// Add this new route for preview
router.post(
  "/preview",
  validate(LandingPage.schema),
  errorHandler(async (req, res) => {
    let payload = {
      metadata: req.body.metadata || {},
      sections: req.body.sections,
      name: req.body.name,
    };

    // Reuse any existing preview with the same name
    for(let key of Object.keys(global.previewLandingPages)){
      if (global.previewLandingPages[key].name === payload.name) {
        //delete global.previewLandingPages[key];
        global.previewLandingPages[key] = payload;
        await global.logEvent("LANDING_PAGE_PREVIEW_CREATE", { payload });
        return res.status(201).json({ previewId:key, ...payload });
      }
    }
    

    // Generate a unique preview ID
    const previewId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Store the preview data in the global variable
    global.previewLandingPages[previewId] = payload;

    // Set an expiration time for the preview data (e.g., 1 hour)
    setTimeout(() => {
      delete global.previewLandingPages[previewId];
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    await global.logEvent("LANDING_PAGE_PREVIEW_CREATE", { payload });
    res.status(201).json({ previewId, ...payload });
  })
);

module.exports = (app) => {
  app.use("/api/landing-pages", router);
  app.use("/page", getLandingRenderRoutes());
};

function getLandingRenderRoutes() {
  const router = express.Router();
  // Existing /:name route
  router.get(
    "/:name",
    errorHandler(async (req, res) => {
      const landingPage = await LandingPage.findOne({ name: req.params.name });
      if (!landingPage) {
        await global.logEvent("LANDING_PAGE_FETCH_ONE_NOT_FOUND", {
          name: req.params.name,
        });
        return res.status(404).json({ message: "Landing page not found" });
      }
      /* await global.logEvent("LANDING_PAGE_FETCH_ONE", {
        name: req.params.name,
      }); */

      global.renderLandingPage(res, landingPage);
    })
  );

  // New /preview/:previewId route
  router.get(
    "/preview/:previewId",
    errorHandler(async (req, res) => {
      const previewId = req.params.previewId;
      const previewData = global.previewLandingPages[previewId];

      if (!previewData) {
        await global.logEvent("LANDING_PAGE_PREVIEW_NOT_FOUND", { previewId });
        return res
          .status(404)
          .json({ message: "Preview not found or expired" });
      }

      await global.logEvent("LANDING_PAGE_PREVIEW_FETCH", { previewId });

      global.renderLandingPage(res, previewData);
    })
  );
  return router;
}
