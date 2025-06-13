import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env.local because vercel dev is not picking it up automatically
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use environment variables for Airtable credentials
const { AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, AIRTABLE_API_KEY } = process.env;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Check for required environment variables
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_API_KEY) {
    return response.status(500).json({
      error: 'Airtable environment variables are not configured.',
      details: 'Please ensure AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, and AIRTABLE_API_KEY are set.'
    });
  }

  const { name, email } = request.body;

  // Check for required fields in the request body
  if (!name || !email) {
    return response.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    // Use fetch to send data to the Airtable API with a Bearer Token
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

    // If the Airtable API returns an error, forward it
    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      console.error('Airtable API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to submit to Airtable.');
    }

    return response.status(200).json({ message: 'Success' });

  } catch (error) {
    console.error('Handler Error:', error);
    return response.status(500).json({
      error: 'An error occurred while processing the request.',
      details: error.message,
    });
  }
}
