# ChicBySally Next.js Deployment Guide

## Overview
This document provides instructions for deploying the ChicBySally Next.js application with social login and StyleCard UI functionality.

## Prerequisites
- Node.js 18.x or later
- npm or yarn package manager
- Access to production environment variables

## Environment Variables Setup

Create a `.env.production` file in the root directory with the following variables:

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET=your_production_secret_here
NEXTAUTH_URL=https://your-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_production_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_production_facebook_client_secret

# Twitter OAuth
TWITTER_CLIENT_ID=your_production_twitter_client_id
TWITTER_CLIENT_SECRET=your_production_twitter_client_secret
```

## Build Process

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Deployment
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

### Azure App Service
1. Create a new Web App
2. Configure deployment center with GitHub Actions
3. Set environment variables in Application Settings
4. Enable Always On setting for continuous operation

## Performance Optimization

### Image Optimization
- All images use Next.js Image component for automatic optimization
- Responsive images adapt to device screen sizes
- Lazy loading enabled by default

### Caching Strategy
- Static assets cached with long-term caching headers
- API routes implement appropriate cache control
- Session data managed through JWT with configurable expiration

## Security Considerations

### Authentication Security
- NextAuth.js session tokens secured with strong secrets
- OAuth providers configured with proper redirect URIs
- CSRF protection enabled for all authentication flows

### HTTPS Requirements
- Production deployment must use HTTPS
- All external resources loaded over HTTPS
- Mixed content blocked and redirected

## Monitoring and Analytics

### Error Tracking
- Console error monitoring enabled
- Custom error boundaries for graceful degradation
- Performance monitoring through Next.js analytics

### User Analytics
- Basic page view tracking
- Authentication flow success/failure tracking
- Feature usage tracking (StyleCard interactions)

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify OAuth client IDs and secrets
   - Check redirect URI configurations
   - Ensure NEXTAUTH_URL matches production domain

2. **Image Loading Issues**
   - Verify image optimization settings in next.config.js
   - Check remote image patterns in next.config.js
   - Ensure proper image file permissions

3. **Responsive Layout Issues**
   - Test across multiple device sizes
   - Verify Tailwind CSS breakpoints
   - Check viewport meta tag in layout

### Support Contacts
- Development Team: support@chicbysally.com
- Infrastructure Team: ops@chicbysally.com

## Version Information
- Application Version: 1.0.0
- Next.js Version: 14.x
- NextAuth.js Version: 5.x
- Deployment Date: August 5, 2025

## Changelog
- Initial deployment with full feature set
- Social login integration (Google, Facebook, Twitter)
- StyleCard virtual try-on interface
- Responsive design for all device sizes
- PWA-ready structure with service worker support
