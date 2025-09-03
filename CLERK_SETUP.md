# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for the portfolio application.

## Overview

Clerk provides a complete authentication solution with built-in OAuth providers, user management, and secure session handling. No need to manage OAuth apps manually - Clerk handles everything.

## Setup Steps

### 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for an account
2. Create a new application
3. Choose your preferred authentication methods

### 2. Configure OAuth Providers

In your Clerk dashboard:

1. Navigate to **User & Authentication** > **Social Connections**
2. Enable the providers you want to use:
   - **GitHub**: Click to enable, Clerk handles the OAuth app creation
   - **Google**: Click to enable, Clerk handles the OAuth app creation  
   - **LinkedIn**: Click to enable, Clerk handles the OAuth app creation
3. Clerk automatically creates and manages the OAuth applications for you

### 3. Environment Variables

Copy your Clerk keys from the **API Keys** section in your dashboard:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### 4. Domain Configuration

For production deployment:

1. In your Clerk dashboard, go to **Domains**
2. Add your production domain (e.g., `yoursite.com`)
3. Update the environment variables with your production URLs

## Features Included

### Authentication Components
- **SignInButton**: Modal-based sign-in experience
- **SignOutButton**: Clean sign-out functionality
- **useUser**: Access to current user data
- **useAuth**: Authentication state management

### Middleware & Route Protection
- **clerkMiddleware**: Modern middleware approach (replaces deprecated authMiddleware)
- **createRouteMatcher**: Define public routes that don't require authentication
- **auth().protect()**: Protect specific routes dynamically

### API Protection
- All signature creation/deletion routes are protected
- User data is automatically validated server-side
- Built-in CSRF protection and security measures

### User Data Access
The app automatically accesses:
- User's full name and username
- Profile image
- Connected OAuth provider information
- Secure user ID for database operations

## Customization Options

### Sign-In/Sign-Up Pages
You can customize the authentication experience by:
1. Using Clerk's hosted pages (default)
2. Creating custom pages with Clerk components
3. Fully custom authentication flows

### User Profile Management
Clerk provides:
- Built-in user profile management
- Account settings and security features
- Multi-factor authentication options
- Session management across devices

## Development vs Production

### Development
- Use test keys (`pk_test_...` and `sk_test_...`)
- Localhost domains are automatically configured
- No additional domain setup required

### Production
- Switch to live keys (`pk_live_...` and `sk_live_...`)
- Configure production domains in dashboard
- Update environment variables in your deployment platform

## Migration from NextAuth

This application has been migrated from NextAuth to Clerk with the following benefits:

### Advantages of Clerk over NextAuth
1. **No OAuth App Management**: Clerk handles OAuth app creation and management
2. **Built-in UI Components**: Pre-built, customizable authentication components
3. **Better Security**: Advanced security features and automatic updates
4. **User Management**: Built-in user dashboard and management tools
5. **Simpler Setup**: Less configuration required
6. **Better Developer Experience**: More intuitive APIs and documentation

### Data Considerations
- User IDs will be different between NextAuth and Clerk
- Existing signatures will need user ID migration if preserving user associations
- Session management is handled entirely by Clerk

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all Clerk env vars are properly set
2. **Domain Configuration**: Check that your domain is added in Clerk dashboard  
3. **API Routes**: Verify that protected routes use Clerk's `auth()` helper
4. **Component Imports**: Make sure you're importing from `@clerk/nextjs`

### Debug Mode
Set `CLERK_DEBUG=true` in development to see detailed logs.

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [OAuth Provider Setup](https://clerk.com/docs/authentication/social-connections)
- [API Reference](https://clerk.com/docs/references/nextjs)

