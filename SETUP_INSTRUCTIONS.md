# Trees Amplify App Setup Instructions

## Current Status

✅ **Completed:**
- React app with Trees functionality
- GraphQL queries, mutations, and subscriptions
- Authentication configuration
- Data model for Trees
- Storage configuration
- Frontend components with error handling

⚠️ **Pending:**
- AWS credentials configuration
- Backend deployment

## Next Steps to Complete Setup

### 1. Configure AWS Credentials

You need to set up your AWS credentials to deploy the backend. Follow these steps:

1. **Create an AWS Account** (if you don't have one):
   - Go to [AWS Console](https://aws.amazon.com/console/)
   - Sign up for a free account

2. **Configure AWS CLI**:
   ```bash
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)
   - Default output format (json)

3. **Configure Amplify Profile**:
   ```bash
   npx ampx configure profile
   ```
   Follow the prompts to set up your Amplify profile.

### 2. Deploy the Backend

Once your credentials are configured, deploy the backend:

```bash
npx ampx sandbox
```

This will:
- Deploy your authentication (Cognito User Pool)
- Deploy your database (AppSync GraphQL API)
- Deploy your storage (S3 bucket)
- Generate the `amplifyconfiguration.json` file with real endpoints

### 3. Test the Application

After deployment:
1. The app will automatically reload with the new configuration
2. You can sign up/sign in using the authentication UI
3. Create, view, and delete trees with images
4. Images will be stored in S3 and served via CloudFront

## Features Implemented

### Authentication
- Email-based sign up/sign in
- Protected routes with `withAuthenticator`
- Sign out functionality

### Data Management
- Create trees with name, description, and optional image
- List all trees for the authenticated user
- Delete trees
- Real-time subscriptions (ready for future enhancement)

### Storage
- Image upload to S3
- Public read access for images
- Secure upload with user authentication

### Error Handling
- Graceful error handling for API calls
- User-friendly error messages
- Fallback behavior when services are unavailable

## File Structure

```
src/
├── components/
│   └── TreesApp.jsx          # Main app component
├── graphql/
│   ├── queries.js            # GraphQL queries
│   ├── mutations.js          # GraphQL mutations
│   └── subscriptions.js      # GraphQL subscriptions
├── App.jsx                   # App entry point
├── main.jsx                  # React entry point
└── amplifyconfiguration.json # Amplify config (will be auto-generated)

amplify/
├── auth/resource.ts          # Authentication configuration
├── data/resource.ts          # Database schema
├── storage/resource.ts       # Storage configuration
└── backend.ts               # Backend definition
```

## Troubleshooting

### Common Issues

1. **"Failed to load default AWS credentials"**
   - Run `aws configure` to set up credentials
   - Ensure you have the correct permissions

2. **"Profile 'default' already exists"**
   - Your profile is configured but credentials may be missing
   - Check your AWS credentials file: `~/.aws/credentials`

3. **GraphQL errors**
   - Ensure the backend is deployed: `npx ampx sandbox`
   - Check that `amplifyconfiguration.json` is generated

4. **Image upload fails**
   - Verify storage is deployed
   - Check browser console for CORS errors

### Getting Help

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify Gen2 Guide](https://docs.amplify.aws/gen2/)
- [AWS Support](https://aws.amazon.com/support/)

## Cost Considerations

This setup uses AWS services that may incur costs:
- **Cognito**: Free tier includes 50,000 MAUs
- **AppSync**: Free tier includes 250,000 requests/month
- **S3**: Free tier includes 5GB storage
- **CloudFront**: Free tier includes 1TB data transfer

Monitor your usage in the AWS Console to avoid unexpected charges.
