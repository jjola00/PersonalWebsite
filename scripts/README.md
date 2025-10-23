# Bundle Analysis Tools

This directory contains tools for monitoring and analyzing the JavaScript bundle size of the Next.js application.

## Available Scripts

### Bundle Analysis
- `npm run analyze` - Build the app with bundle analyzer enabled
- `npm run check-bundle` - Check current bundle size against limits
- `npm run size` - Run size-limit checks
- `npm run size:why` - Analyze why bundle is large

## Bundle Size Limits

- **Warning**: 400KB total JS bundle size
- **Error**: 500KB total JS bundle size

## Usage

1. **Build and analyze bundle**:
   ```bash
   npm run build
   npm run analyze
   ```

2. **Check bundle size**:
   ```bash
   npm run check-bundle
   ```

3. **Monitor bundle size in CI**:
   ```bash
   npm run size
   ```

## Bundle Optimization Tips

1. Use dynamic imports for heavy components
2. Implement code splitting
3. Remove unused dependencies
4. Optimize images and assets
5. Use tree-shaking for CSS and JS