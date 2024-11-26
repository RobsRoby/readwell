
async function loadApiKey() {
  const response = await fetch('./api.txt');
  if (!response.ok) {
    throw new Error('Failed to load api.txt');
  }

  const fileContent = await response.text();
  
  // Parse the key-value pair from the file
  const keyValuePair = fileContent.split('=');
  if (keyValuePair[0].trim() === 'GEMINI_API_KEY') {
    return keyValuePair[1].trim(); // Return the API key value
  } else {
    throw new Error('GEMINI_API_KEY not found in api.txt');
  }
}

async function simplify(input) {
  // Load the API key from the file
  const apiKey = await loadApiKey();

  // Define the endpoint URL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  // Define the request payload
  const payload = {
    contents: [
      {
        parts: [
          {
            text: "Make the sentence easy to read:" + input
          }
        ]
      }
    ]
  };

  try {
    // Make the POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // Convert payload to JSON
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response
    const responseData = await response.json();

    // Extract and return the simplified text
    return responseData.candidates[0].content.parts[0].text;

  } catch (error) {
    // Handle errors
    console.error('Error during API request:', error);
    throw error; // Re-throw the error if needed
  }
}

// simplify("Time, that relentless and intangible force, unfurls with a paradoxical duality—eternally linear yet deeply cyclical, a phenomenon whose passage we measure with the steady tick of clocks but perceive through the erratic ebbs and flows of memory.")
//   .then(simplifiedText => console.log(simplifiedText))
//   .catch(error => console.error("Error:", error));
