import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env.local for local development with `netlify dev`
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

const { AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, AIRTABLE_API_KEY } = process.env;

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // Check for required environment variables
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Airtable environment variables are not configured.',
        details: 'Please ensure AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, and AIRTABLE_API_KEY are set.'
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  
  if (!event.body) {
      return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Request body is missing.' }),
          headers: { 'Content-Type': 'application/json' },
      };
  }

  const { name, email } = JSON.parse(event.body);

  if (!name || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Name and email are required.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Name: name,
                Email: email,
              },
            },
          ],
        }),
      }
    );

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      console.error('Airtable API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to submit to Airtable.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error('Handler Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'An error occurred while processing the request.',
        details: error.message,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
