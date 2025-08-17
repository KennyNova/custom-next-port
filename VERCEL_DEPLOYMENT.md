# Vercel Deployment Guide

This guide helps you properly deploy your portfolio to Vercel and configure the required environment variables.

## Required Environment Variables

Your application requires the following environment variables to be configured in Vercel:

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio-blog
```
- **Required**: Yes
- **Description**: MongoDB connection string for your database
- **Where to get it**: MongoDB Atlas or your MongoDB provider

### 2. GitHub Integration (Optional)
```
GITHUB_TOKEN=ghp_your_github_personal_access_token
```
- **Required**: No (but recommended for GitHub projects display)
- **Description**: GitHub Personal Access Token for fetching your repositories
- **Where to get it**: GitHub Settings > Developer settings > Personal access tokens

### 3. Authentication (Optional)
```
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-string
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_oauth_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_oauth_client_secret
```

### 4. Cal.com Integration (Optional)
```
CALCOM_API_KEY=your_calcom_api_key
CALCOM_BASE_URL=https://your-calcom-instance.com
```

## Setting Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** > **Environment Variables**
3. Add each environment variable:
   - **Name**: The variable name (e.g., `MONGODB_URI`)
   - **Value**: The actual value
   - **Environments**: Select Production, Preview, and Development

## Common Issues and Solutions

### 1. Blank Home Page
**Problem**: Home page shows loading skeleton indefinitely
**Cause**: API routes are failing due to missing environment variables
**Solution**: Configure `MONGODB_URI` in Vercel environment variables

### 2. 500 Errors on API Routes
**Problem**: `/api/projects` and `/api/blog` return 500 errors
**Cause**: Database connection is failing
**Solution**: 
- Verify `MONGODB_URI` is correctly set
- Check MongoDB Atlas allows connections from Vercel (0.0.0.0/0)
- Ensure database exists and has proper permissions

### 3. 404 Errors for Terms/Privacy
**Problem**: Links to `/terms` and `/privacy` return 404
**Solution**: These pages have been created and should now work

### 4. GitHub Projects Not Loading
**Problem**: GitHub projects don't appear in projects page
**Cause**: Missing or invalid `GITHUB_TOKEN`
**Solution**: 
- Create a GitHub Personal Access Token
- Add it to Vercel environment variables as `GITHUB_TOKEN`
- Token needs `repo` and `user` scopes for public repositories

## Testing Your Deployment

After configuring environment variables:

1. **Redeploy**: Trigger a new deployment in Vercel
2. **Check API Routes**: Visit `https://your-domain.vercel.app/api/projects`
3. **Verify Home Page**: Ensure the home page loads without infinite loading
4. **Test Navigation**: Check that all footer links work

## MongoDB Atlas Setup

If you need to set up MongoDB Atlas:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get the connection string
5. Replace `<password>` with your actual password
6. Ensure network access allows connections from anywhere (0.0.0.0/0)

## GitHub Token Setup

To create a GitHub Personal Access Token:

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token"
3. Select scopes: `repo`, `user`
4. Copy the token and add it to Vercel

## Troubleshooting Commands

If you're still having issues, check the deployment logs:

```bash
# Install Vercel CLI
npm i -g vercel

# View deployment logs
vercel logs your-deployment-url
```

## Support

If you continue to experience issues:
1. Check Vercel's deployment logs
2. Verify all environment variables are set correctly
3. Ensure your MongoDB instance is accessible
4. Check the browser console for specific error messages
