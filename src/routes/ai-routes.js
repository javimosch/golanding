const axios = require("axios");

module.exports = (app) => {
  app.post("/api/ai/query", async (req, res) => {
    try {
      const { query, code } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      console.log(`Bearer ${process.env.ANTHROPIC_API_KEY}`)

      const content = [
        {
          type: "text",
          text: `${query}\n\ncode:\n\n${code}`,
        },
      ]
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-5-sonnet-20240620",
          //model:"claude-3-haiku-20240307",
          max_tokens: 5000,
          temperature: 0,
          system:
            "You are a tailwindcss expert and your goal is to improve code source given user instruction and output a valid base64 string containing the generated code. Output a valid base64 string only",
          messages: [
            {
              role: "user",
              content: content,
            },
          ],
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"
          },
        }
      );
      let responseData = response.data
      const aiResponse = response.data.content[0].text.trim();
      try {
        const atob = require("atob");
        let code = formatHtml(atob(extractLongestBase64(aiResponse)));

        console.log("AI_QUERY_SUCCESS",{
            content,
            code,
            aiResponse
        })
        await global.logEvent("AI_QUERY_SUCCESS", {
          code,
        });
        res.json({ code });
      } catch (err) {
        console.error("AI_QUERY_DECODE_FAIL", {
          content,
          responseData,
          status: err?.response?.status||"",
          data: err?.response?.data||"",
          err: (err?.response?.status||""===''&&err?.response?.data||""==='') ? err : 'hidden'
        });
        await global.logEvent("AI_QUERY_DECODE_FAIL", {
          aiResponse,
          err: err.message,
        });
      }
    } catch (err) {
      console.error("AI_QUERY_AXIOS_FAIL", {
        status: err?.response?.status||"",
        data: err?.response?.data||"",
        err: (err?.response?.status||""===''&&err?.response?.data||""==='') ? err : 'hidden'
      });
      await global.logEvent("AI_QUERY_AXIOS_FAIL", {
        status: err?.response?.status||"",
        data: err?.response?.data||"",
        err: (err?.response?.status||""===''&&err?.response?.data||""==='') ? err : 'hidden'
      });
      res
        .status(500)
        .json({ error: "An error occurred while generating the sonnet" });
    }
  });
};


function extractLongestBase64(input) {
    // Define a regular expression to match base64 encoded strings
    const base64Pattern = /([A-Za-z0-9+/]+={0,2})/g; // Base64 pattern
    const matches = input.match(base64Pattern); // Get matches

    // Initialize a variable to hold the longest valid base64
    let longestBase64 = '';

    // Check each match and determine if it's valid base64
    (matches || []).forEach(match => {
        const len = match.length;
        // Check if match is valid base64: length (excluding padding) must be a multiple of 4
        if (len > 0 && (len % 4 === 0) && /^[A-Za-z0-9+/]*={0,2}$/.test(match)) {
            // Update longestBase64 if the current match is longer
            if (len > longestBase64.length) {
                longestBase64 = match;
            }
        }
    });

    return longestBase64; // Return the longest valid base64 string found
}





function formatHtml(input) {
    // Decode escaped characters
    const beautify = require('html-beautify');
    const decodedHtml = input.replace(/\\x3C/g, '<')      // replace \x3C with <
                            .replace(/\\x3E/g, '>')      // replace \x3E with >
                            .replace(/\\n/g, '\n')       // replace \n with actual new lines
                            .replace(/\\t/g, '\t')       // replace \t with tabs
                            .replace(/&amp;/g, '&')      // replace &amp; with &
                            .replace(/&quot;/g, '"')     // replace &quot; with "
                            .replace(/&apos;/g, "'")     // replace &apos; with '
                            .replace(/&lt;/g, '<')       // replace &lt; with <
                            .replace(/&gt;/g, '>');      // replace &gt; with >

    // Format the HTML
    const formattedHtml = beautify(decodedHtml, {
        indent_size: 4, // Number of spaces to indent
        space_in_empty_paren: true,
        unformatted: ["code", "pre"], // Tags that shouldn't be reformatted
    });

    return formattedHtml;
}