const axios = require("axios");
require("dotenv").config();
const { VertexAI } = require("@google-cloud/vertexai");
const fs = require("fs");
const { PredictionServiceClient } = require("@google-cloud/aiplatform").v1;
const { helpers } = require("@google-cloud/aiplatform");
const uploadFileWithFolder = require("./utils/s3Upload");

// Read the credentials file
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Parse the credentials file
const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));
const projectId = credentials.project_id;
const location = process.env.LOCATION;
const clientOptions = {
  apiEndpoint: `${location}-aiplatform.googleapis.com`,
};

const predictionServiceClient = new PredictionServiceClient(clientOptions);

const vertex_ai = new VertexAI({
  project: projectId,
  location: location,
});

// Text Generation Model
const model = "gemini-1.5-flash-001";

const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
});

const generateContentForInHouse = async (drink, ingredient) => {

  // {
  //   text: `I need an alcohol recipe to create a drink. Please give me Recipe name, Ingredients and its quantities both in same array in different object, Instructions separated into arrays. Return data in JSON format this is my ${drink} and ${ingredient}`,
  // }, 
   const req = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `I need an alcohol recipe to create a drink. Please give me Recipe name, category, Ingredients and its quantities both in same array in different object, Instructions separated into array of string. Return data in JSON format this is my ${drink} and ${ingredient}`,
          },
        ],
      },
    ],
  };

  const streamingResp = await generativeModel.generateContentStream(req);
  const res = await streamingResp.response;

  // Extracting the content text
  let contentText = res.candidates[0].content.parts[0].text;

  console.log(contentText, "contentText");

  // Check if 'json' exists, then replace
  if (contentText.includes("json")) {
    contentText = contentText.replace(/json/g, "");
  }

  // Check if 'data' exists, then replace
  if (contentText.includes("data")) {
    contentText = contentText.replace(/data/g, "");
  }

  // Always remove backticks if they exist
  contentText = contentText.replace(/[`]/g, "").trim();

  const parsedResponse = JSON.parse(contentText);

  // Normalize the response to ensure consistent property names

  const normalizedResponse = {
    recipeName:
      parsedResponse.recipeName ||
      parsedResponse.name ||
      parsedResponse.recipe_name,
    category: parsedResponse?.category,
    ingredients: parsedResponse.ingredients,
    instructions: parsedResponse.instructions,
  };

  return normalizedResponse;
};

const generateContentForTownName = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
        },
      }
    );

    const townName = response.data.address.suburb;

    return townName;
  } catch (error) {
    console.error("Error fetching town name from OSM:", error);
    // throw new Error('Unable to fetch town name');
  }
};

const famousDrinkSInTown = async (townName) => {
  const req = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Please provide me 2 famous drinks in ${townName}. Include each drink's name, Ingredients and its quantities both in same array in different object, Instructions separated into arrays and categorize each drink as one of the following: POPULAR, MOJITO, OLD_FASHION, or LONG_ISLAND_TEA. Return the data in JSON format.`,
          },
        ],
      },
    ],
  };

  try {
    const streamingResp = await generativeModel.generateContentStream(req);
    const res = await streamingResp.response;

    // Extracting the content text
    let contentText = res.candidates[0].content.parts[0].text;

    console.log(contentText, "contentText");

    // Check if 'json' exists, then replace
    if (contentText.includes("json")) {
      contentText = contentText.replace(/json/g, "");
    }

    // Check if 'data' exists, then replace
    if (contentText.includes("data")) {
      contentText = contentText.replace(/data/g, "");
    }

    // Always remove backticks if they exist
    contentText = contentText.replace(/[`]/g, "").trim();

    const parsedResponse = JSON.parse(contentText);

    return parsedResponse;
  } catch (error) {
    console.error("Error parsing the response:", error);
  }
};

const generateImage = async (prompt, filename) => {
  console.log(prompt, "prompt");

  const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;

  const instanceValue = helpers.toValue({ prompt });
  const instances = [instanceValue];

  const parameter = {
    sampleCount: 1,
    aspectRatio: "1:1",
    safetyFilterLevel: "block_some",
    personGeneration: "allow_adult",
  };
  const parameters = helpers.toValue(parameter);

  const request = {
    endpoint,
    instances,
    parameters,
  };

  const [response] = await predictionServiceClient.predict(request);
  const predictions = response.predictions;

  if (predictions.length === 0) {
    console.log(
      "No image was generated. Check the request parameters and prompt."
    );
    return null;
  }

  const prediction = predictions[0];
  const buff = Buffer.from(
    prediction.structValue.fields.bytesBase64Encoded.stringValue,
    "base64"
  );

  // Upload the image to S3
  const imageUrl = await uploadFileWithFolder(
    buff,
    filename,
    "image/png",
    "mydrink"
  ); // Specify folder name

  return imageUrl; // Return the image URL
};

module.exports = {
  generateContentForInHouse,
  generateContentForTownName,
  famousDrinkSInTown,
  generateImage,
};
