/**
 * Updates the preview landing pages and logs events.
 * 
 * @param {Object} payload - The payload containing the landing page data.
 * @returns {String} The preview ID.
 */
module.exports = function updatePreviewAndLogEvent(payload) {
  
  // Initialize the global preview landing pages object if it doesn't exist.
  global.previewLandingPages = global.previewLandingPages || {};

  // Inject data-editable attributes into the payload HTML.
  payload = injectDataEditableAttr(payload)
  
  // Iterate through the existing preview landing pages to find a matching name.
  for (let key of Object.keys(global.previewLandingPages)) {
    if (global.previewLandingPages[key].name === payload.name) {
      // Update the existing preview landing page.
      global.previewLandingPages[key] = payload;
      // Log the update event.
      global.logEvent("LANDING_PAGE_PREVIEW_UPDATE", { payload });
      return key;
    }
  }
  
  // Generate a new preview ID if no matching name is found.
  const previewId =
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  global.previewLandingPages[previewId] = payload;

  // Set an expiration time for the preview data (e.g., 1 hour).
  setTimeout(() => {
    delete global.previewLandingPages[previewId];
  }, 60 * 60 * 1000); // 1 hour in milliseconds

  // Log the create event.
  global.logEvent("LANDING_PAGE_PREVIEW_CREATE", {
    name: payload.name,
  });

  return previewId;
};


/**
 * Injects data-editable attributes into the payload HTML.
 * 
 * @param {Object} payload - The payload containing the landing page data.
 * @returns {Object} The updated payload with data-editable attributes.
 */
function injectDataEditableAttr(payload){
  let html = payload.html;
  let hasHtml = html.includes("<html");
  let hasHead = html.includes("<head");
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);

  // Generate a unique ID for data-editable attributes.
  const editableId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Add data-editable attributes to text elements.
  $("p, span, h1, h2, h3, h4, h5, h6,label,button").each((index, element) => {
    if (!$(element).attr("data-editable")) {
      $(element).attr("data-editable", `${editableId()}`);
    }
  });
  $(":has(text)").each((index, element) => {
    if (!$(element).attr("data-editable")) {
      $(element).attr("data-editable", `${editableId()}`);
    }
  });

  // Update existing data-editable attributes.
  $("[data-editable]").each((index, element) => {
    $(element).attr("data-editable", `${editableId()}`);
  });

  // Update the payload HTML.
  html = $.html();

  // Remove unnecessary HTML tags if they don't exist in the original HTML.
  if (!hasHead && !hasHtml) {
    html = html
      .split("<html><head></head><body>")
      .join("")
      .split("</body></html>")
      .join("");
  }

  payload.html = html;
  return payload
}
