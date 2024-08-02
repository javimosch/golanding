const renderLandingPage = (res, landingPage) => {
  // Check if the client is requesting HTML
  const acceptHeader = res.get("Accept");
  //if (acceptHeader && acceptHeader.includes("text/html")) {
    // Concatenate all sections HTML
    const htmlContent = landingPage.sections.join("");

    // Wrap the content in a basic HTML structure
    const fullHtml = `
        ${htmlContent.includes('<head')?'':`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${landingPage.name}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://unpkg.com/frenchkiss/dist/umd/frenchkiss.js"></script>
              <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
              />
              ${landingPage.metadata.head || ""}
          </head>        
        `}
        
        ${htmlContent.includes('<body')?'':'<body>'}
            ${htmlContent}
        ${htmlContent.includes('<body')?'':'</body>'}
        </html>
      `;

    res.setHeader("Content-Type", "text/html");
    return res.send(fullHtml);
  //}

  // If not requesting HTML, return JSON as before
  //res.json(landingPage);
};

module.exports = renderLandingPage;
