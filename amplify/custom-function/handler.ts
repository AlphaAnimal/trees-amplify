// Configuration for your Flask service
const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'https://your-flask-service-url.com';

interface LambdaEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  body?: string;
  requestContext?: {
    authorizer?: {
      jwt?: {
        claims?: Record<string, string>;
      };
    };
  };
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  try {
    // Extract the path and method from the event
    const { path, httpMethod, headers, body } = event;
    
    // For Lambda functions, we can get the user info from the event context
    // or use the JWT token directly if it's passed in headers
    let userId: string | undefined;
    
    // Try to get user info from the event context (if using Lambda authorizer)
    if (event.requestContext?.authorizer?.jwt?.claims?.sub) {
      userId = event.requestContext.authorizer.jwt.claims.sub;
    }
    
    // If no user ID found, try to get it from Authorization header
    if (!userId && headers.Authorization) {
      // For now, we'll just check if the header exists
      // In a real implementation, you'd verify the JWT token
      userId = 'authenticated-user'; // Placeholder
    }

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Forward the request to your Flask service
    const flaskUrl = `${FLASK_SERVICE_URL}${path}`;
    
    const response = await fetch(flaskUrl, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headers.Authorization || '',
        'X-User-ID': userId,
        ...headers,
      },
      body: body || undefined,
    });

    const responseBody = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: responseBody,
    };
  } catch (error) {
    console.error('Error in proxy function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
