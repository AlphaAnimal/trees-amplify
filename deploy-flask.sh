#!/bin/bash

# Deployment script for Flask service to AWS
# This script helps deploy your Flask service to AWS Lambda or ECS

set -e

# Configuration
SERVICE_NAME="family-trees-flask-service"
AWS_REGION="us-east-1"
ECR_REPOSITORY="family-trees-flask"
LAMBDA_FUNCTION_NAME="family-trees-flask-service"

echo "🚀 Starting Flask service deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    exit 1
fi

# Function to deploy to ECS
deploy_to_ecs() {
    echo "📦 Deploying to ECS..."
    
    # Create ECR repository if it doesn't exist
    aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
    
    # Get ECR login token
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin \
        $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build and tag Docker image
    docker build -f Dockerfile.flask -t $ECR_REPOSITORY .
    docker tag $ECR_REPOSITORY:latest \
        $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    
    # Push to ECR
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    
    echo "✅ ECS deployment completed!"
    echo "🔗 ECR Repository: https://console.aws.amazon.com/ecr/repositories/$ECR_REPOSITORY"
}

# Function to deploy to Lambda
deploy_to_lambda() {
    echo "📦 Deploying to Lambda..."
    
    # Create ECR repository for Lambda
    aws ecr describe-repositories --repository-names $ECR_REPOSITORY-lambda --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_REPOSITORY-lambda --region $AWS_REGION
    
    # Get ECR login token
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin \
        $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build and tag Docker image for Lambda
    docker build -f Dockerfile.flask -t $ECR_REPOSITORY-lambda .
    docker tag $ECR_REPOSITORY-lambda:latest \
        $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY-lambda:latest
    
    # Push to ECR
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY-lambda:latest
    
    echo "✅ Lambda deployment completed!"
    echo "🔗 ECR Repository: https://console.aws.amazon.com/ecr/repositories/$ECR_REPOSITORY-lambda"
}

# Main deployment logic
echo "Choose deployment target:"
echo "1) ECS (recommended for production)"
echo "2) Lambda (good for serverless)"
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        deploy_to_ecs
        ;;
    2)
        deploy_to_lambda
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up API Gateway to expose your service"
echo "2. Configure CORS settings"
echo "3. Update your Amplify app with the service URL"
echo "4. Test the integration"
