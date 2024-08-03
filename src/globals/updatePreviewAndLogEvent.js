module.exports = function updatePreviewAndLogEvent(payload) {
    for(let key of Object.keys(global.previewLandingPages)){
      if (global.previewLandingPages[key].name === payload.name) {
        global.previewLandingPages[key] = payload;
        global.logEvent("LANDING_PAGE_PREVIEW_UPDATE", { payload });
        return { previewId:key, ...payload };
      }
    }
    const previewId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    global.previewLandingPages[previewId] = payload;
    global.logEvent("LANDING_PAGE_PREVIEW_CREATE", { 
      name:payload.name
     });
  }
  