const renderLandingPage = (res, landingPage) => {
  // Check if the client is requesting HTML
  const acceptHeader = res.get("Accept");
  //if (acceptHeader && acceptHeader.includes("text/html")) {
  // Concatenate all sections HTML

  console.log("RENDER",{
    sections:landingPage.sections
  })

  const htmlContent = landingPage.sections.join("");

  // Wrap the content in a basic HTML structure
  let fullHtml = `
        ${
          htmlContent.includes("<head")
            ? ""
            : `
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
        `
        }
        
        ${htmlContent.includes("<body") ? "" : "<body>"}
            ${htmlContent}
            ${getEditScript()}
        ${htmlContent.includes("<body") ? "" : "</body>"}
        </html>
      `;

  res.setHeader("Content-Type", "text/html");
  return res.send(fullHtml);
  //}

  // If not requesting HTML, return JSON as before
  //res.json(landingPage);
};

function getEditScript(){
  return `
  <script>
  document.addEventListener('DOMContentLoaded', () => {
  const editableNodes = document.querySelectorAll('[data-editable]');
  let currentEditableNode = null;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden';
  modal.innerHTML = ${`\`
    <div class="bg-white rounded-lg p-6 w-3/4 max-w-2xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Edit Content</h2>
        <button id="closeModal" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <textarea id="editContent" class="w-full h-64 p-2 border rounded mb-4"></textarea>
      <button id="saveChanges" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Save Changes
      </button>
    </div>
  \``};
  document.body.appendChild(modal);

  const textarea = document.getElementById('editContent');
  const saveButton = document.getElementById('saveChanges');
  const closeButton = document.getElementById('closeModal');

  // Add click event to editable nodes
  editableNodes.forEach(node => {
    node.addEventListener('click', () => {
      currentEditableNode = node;
      textarea.value = node.innerHTML;
      modal.classList.remove('hidden');
    });
  });

  // Save changes
  saveButton.addEventListener('click', async () => {
    if (currentEditableNode) {
      const editableValue = currentEditableNode.getAttribute('data-editable');
      const newContent = textarea.value;

      try {
        const response = await fetch('/api/landing-pages/partial', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            editableValue,
            newContent,
            previewId: location.href.split('/').reverse()[0].split('?')[0]
          }),
        });

        if (response.ok) {
          currentEditableNode.innerHTML = newContent;
          closeModal();
        } else {
          console.error('Failed to save changes');
        }
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    }
  });

  // Close modal functions
  function closeModal() {
    modal.classList.add('hidden');
    currentEditableNode = null;
  }

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});
  </script>
  `
}

module.exports = renderLandingPage;
