const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Get the audio URL from query params
  const audioUrl = event.queryStringParameters.url;

  try {
    // Fetch the audio from the external site
    const response = await fetch(audioUrl);
    const audioBuffer = await response.buffer();

    // Return the audio with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch audio" }),
    };
  }
};
