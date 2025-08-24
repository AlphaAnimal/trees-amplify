# Flask Service Integration with Amplify Authentication

This guide will help you integrate your Flask backend service with your Amplify app's authentication system.

## Overview

Your Flask service will be deployed to AWS and integrated with Cognito authentication from your Amplify app. The integration includes:

1. **Authentication**: JWT token verification using Cognito
2. **API Gateway**: Exposing your Flask service endpoints
3. **CORS**: Allowing requests from your Amplify app
4. **Proxy**: Lambda function to handle authentication and routing

## Step 1: Prepare Your Flask Service

### 1.1 Add Authentication Middleware

Add this to your Flask app to verify Cognito JWT tokens:

```python
import jwt
import requests
from functools import wraps
from flask import request, jsonify, current_app

def get_cognito_public_keys():
    """Fetch Cognito public keys for JWT verification"""
    region = 'us-east-1'  # Update with your region
    user_pool_id = 'your-user-pool-id'  # Update with your user pool ID
    
    url = f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'
    response = requests.get(url)
    return response.json()

def verify_jwt_token(token):
    """Verify JWT token from Cognito"""
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Decode token without verification first to get the key ID
        unverified_header = jwt.get_unverified_header(token)
        key_id = unverified_header['kid']
        
        # Get public keys
        public_keys = get_cognito_public_keys()
        
        # Find the correct public key
        public_key = None
        for key in public_keys['keys']:
            if key['kid'] == key_id:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        
        if not public_key:
            raise Exception('Public key not found')
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=['RS256'],
            audience='your-app-client-id',  # Update with your app client ID
            issuer=f'https://cognito-idp.us-east-1.amazonaws.com/your-user-pool-id'
        )
        
        return payload
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header required'}), 401
        
        payload = verify_jwt_token(auth_header)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Add user info to request context
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated_function
```

### 1.2 Update Your Flask Routes

Add the `@require_auth` decorator to your protected routes:

```python
from flask import Flask, request, jsonify
from your_auth_module import require_auth

app = Flask(__name__)

@app.route('/family-trees', methods=['GET'])
@require_auth
def get_family_trees():
    # Access user info: request.user
    user_id = request.user['sub']
    # Your existing logic here
    return jsonify({'trees': []})

@app.route('/family-trees', methods=['POST'])
@require_auth
def create_family_tree():
    user_id = request.user['sub']
    data = request.get_json()
    # Your existing logic here
    return jsonify({'message': 'Tree created'})

# Add similar decorators to other protected routes
```

### 1.3 Add CORS Support

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://your-amplify-app-domain.com'], 
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
```

### 1.4 Add Health Check Endpoint

```python
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})
```

## Step 2: Deploy Flask Service to AWS

### 2.1 Containerize Your Flask App

1. Create a `requirements.txt` file with your dependencies
2. Use the provided `Dockerfile.flask`
3. Build and test locally:

```bash
docker build -f Dockerfile.flask -t family-trees-flask .
docker run -p 5000:5000 family-trees-flask
```

### 2.2 Deploy Using the Script

```bash
chmod +x deploy-flask.sh
./deploy-flask.sh
```

Choose option 1 (ECS) for production or option 2 (Lambda) for serverless.

### 2.3 Set Up API Gateway

1. Go to AWS API Gateway console
2. Create a new REST API
3. Create resources and methods for your endpoints
4. Deploy the API
5. Note the API Gateway URL

## Step 3: Configure Amplify Backend

### 3.1 Update Environment Variables

Add your Flask service URL to your Amplify environment:

```bash
amplify env update
# Add: FLASK_SERVICE_URL=https://your-api-gateway-url.amazonaws.com
```

### 3.2 Deploy Amplify Backend

```bash
amplify push
```

## Step 4: Update Your React App

### 4.1 Use the Flask Service

Update your `TreesApp.jsx` to use the Flask service:

```jsx
import { flaskService } from '../services/flaskService';

// Replace your existing CRUD operations with Flask service calls
async function fetchFamilyTrees() {
  try {
    const trees = await flaskService.getFamilyTrees();
    setTrees(trees);
  } catch (error) {
    console.error('Error fetching family trees:', error);
  }
}

async function createFamilyTree(treeData) {
  try {
    await flaskService.createFamilyTree(treeData);
    fetchFamilyTrees(); // Refresh the list
  } catch (error) {
    console.error('Error creating family tree:', error);
  }
}
```

### 4.2 Handle Authentication Errors

```jsx
import { signOut } from 'aws-amplify/auth';

// In your error handling
if (error.message === 'Authentication required') {
  await signOut();
  // Redirect to login or show login modal
}
```

## Step 5: Testing

### 5.1 Test Authentication

1. Sign in to your Amplify app
2. Try accessing a protected Flask endpoint
3. Verify the request includes the Authorization header
4. Check that the Flask service validates the token

### 5.2 Test CRUD Operations

1. Create a family tree
2. Read family trees
3. Update a family tree
4. Delete a family tree

## Step 6: Security Considerations

### 6.1 Environment Variables

Store sensitive information in environment variables:

```python
# In your Flask app
import os

COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
COGNITO_APP_CLIENT_ID = os.environ.get('COGNITO_APP_CLIENT_ID')
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
```

### 6.2 CORS Configuration

Only allow your Amplify app domain:

```python
CORS(app, origins=[os.environ.get('ALLOWED_ORIGIN')])
```

### 6.3 Rate Limiting

Consider adding rate limiting to your Flask service:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that your API Gateway CORS settings match your Amplify app domain
2. **Authentication Errors**: Verify your Cognito user pool ID and app client ID
3. **Network Errors**: Ensure your Flask service is accessible from the internet
4. **Token Expiration**: Handle token refresh in your React app

### Debugging

1. Check CloudWatch logs for your Flask service
2. Use browser developer tools to inspect network requests
3. Verify JWT token format and content
4. Test endpoints directly with tools like Postman

## Next Steps

1. **Monitoring**: Set up CloudWatch alarms and dashboards
2. **Logging**: Implement structured logging in your Flask service
3. **Caching**: Add Redis or DynamoDB caching for better performance
4. **CI/CD**: Set up automated deployment pipelines

## Support

If you encounter issues:

1. Check the AWS documentation for your specific service
2. Review CloudWatch logs for error details
3. Test individual components in isolation
4. Consider using AWS X-Ray for distributed tracing
