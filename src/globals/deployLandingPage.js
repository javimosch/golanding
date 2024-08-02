const axios = require("axios");

async function deployLandingPage(landingPage) {
  try {
    let domains = landingPage.metadata?.deployment?.domains || [];

    if(process.env.LP_DEPLOYMENT_DOMAIN_AFFIX&&process.env.LP_ALLOW_DEPLOYMENT_SECTION==='0'){
      domains = [landingPage.name+process.env.LP_DEPLOYMENT_DOMAIN_AFFIX]
    }

    let whiteListPartial =
      ((process.env.PROXYFLARE_DOMAINS_WHITELIST_PARTIAL||"").split(',') || []).filter(d=>!!d);
    if (whiteListPartial.length > 0) {

      let blacklistedDomains = domains.filter((d) => !whiteListPartial.some(p=>d.includes(p)));

      if(blacklistedDomains.length>0){
        await global.logEvent("LANDING_PAGE_DEPLOYMENT_DOMAINS_FILTERED_OUT", {
          reason: "Some domains do not pass the whitelist check",
          blacklistedDomains
        });
      }

      domains = domains.filter((d) => whiteListPartial.some(p=>d.includes(p)));
    }

    if (domains.length === 0) {
      //throw new Error("No domains specified for deployment");

      await global.logEvent("LANDING_PAGE_DEPLOYMENT_SKIP", {
        reason: "No valid domains specified for deployment",
      });
      return {
        ...(landingPage.metadata?.deployment || {}),
        status: "pending",
        deployedAt: null,
        proxyflareResponse: null,
      };
    }

    const proxyflarePayload = {
      domains: domains,
      proxyHost: process.env.PROXYFLARE_PROXY_HOST_DEFAULT,
      proxyPort: process.env.PROXYFLARE_PROXY_PORT_DEFAULT,
      proxyProtocol: "http", // Default to http
      target: `${process.env.APP_PROTOCOL || "http"}://${
        process.env.APP_HOST || "localhost"
      }/page/${landingPage.name}`,
      advancedConfig: `location / { proxy_pass http://${process.env.PROXYFLARE_PROXY_HOST_DEFAULT}:${process.env.PROXYFLARE_PROXY_PORT_DEFAULT}/page/${landingPage.name}; }`,
    };

    const proxyflareResponse = await axios.post(
      `${process.env.PROXYFLARE_URL}/api/reverse-proxy`,
      proxyflarePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PROXYFLARE_APIKEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update the landing page with deployment information
    landingPage.metadata = {
      ...landingPage.metadata,
      deployment: {
        ...landingPage.metadata?.deployment,
        status: "deployed",
        deployedAt: new Date(),
        proxyflareResponse: proxyflareResponse.data,
      },
    };

    await global.logEvent("LANDING_PAGE_DEPLOYMENT_SUCCESS", {
      deployment: landingPage.metadata.deployment,
    });

    return landingPage.metadata.deployment;
  } catch (error) {
    console.error("Deployment error:", error);
    await global.logEvent("LANDING_PAGE_DEPLOYMENT_FAIL", {
      error: error?.response?.data || error.stack,
    });
    //throw new Error(`Deployment failed: ${error.message}`);
  }
}

module.exports = deployLandingPage;
