module.exports = function updatePreviewAndLogEvent(payload) {
  // Global variable to store preview data
  global.previewLandingPages = global.previewLandingPages || {};

  let sections = [...payload.sections];
  sections = sections.map((sectionHTML) => {
    const cheerio = require("cheerio");
    const $ = cheerio.load(sectionHTML);
    
    const editableId =
      ()=>Date.now().toString(36) + Math.random().toString(36).substr(2);
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

    $("[data-editable]").each((index, element) => {
      
      $(element).attr("data-editable", `${editableId()}`);
    });
    return $.html()
  });
  payload.sections = sections;

  for (let key of Object.keys(global.previewLandingPages)) {
    if (global.previewLandingPages[key].name === payload.name) {
      global.previewLandingPages[key] = payload;
      global.logEvent("LANDING_PAGE_PREVIEW_UPDATE", { payload });
      return key
    }
  }
  const previewId =
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  global.previewLandingPages[previewId] = payload;

  // Set an expiration time for the preview data (e.g., 1 hour)
  setTimeout(() => {
    delete global.previewLandingPages[previewId];
  }, 60 * 60 * 1000); // 1 hour in milliseconds

  global.logEvent("LANDING_PAGE_PREVIEW_CREATE", {
    name: payload.name,
  });

  return previewId
};
