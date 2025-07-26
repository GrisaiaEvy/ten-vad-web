# Troubleshooting Guide

## WASM Module Loading Issues

If you encounter the error "createVADModule not found", follow these steps:

### 1. Check WASM Files

Ensure the following files exist in the correct location:

```bash
ls -la public/wasm/
# Should show:
# ten_vad.js
# ten_vad.wasm
```

### 2. Verify File Permissions

Make sure the WASM files are readable:

```bash
chmod 644 public/wasm/ten_vad.js
chmod 644 public/wasm/ten_vad.wasm
```

### 3. Check Browser Console

Open browser developer tools and check for:
- Network errors loading `/wasm/ten_vad.js`
- Network errors loading `/wasm/ten_vad.wasm`
- JavaScript errors in the console

### 4. Test WASM Loading

Use the test page to verify WASM loading:

1. Start the development server: `npm start`
2. Navigate to: `http://localhost:3000/test-wasm-loading.html`
3. Check if all steps pass

### 5. Common Solutions

#### Solution 1: Clear Browser Cache
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache and cookies
- Try in incognito/private mode

#### Solution 2: Check CORS Settings
If using a local server, ensure CORS is properly configured:

```bash
# Use serve with CORS headers
npx serve -s build -l 3001 --cors
```

#### Solution 3: Verify File Paths
Ensure the WASM files are accessible at:
- `http://localhost:3000/wasm/ten_vad.js`
- `http://localhost:3000/wasm/ten_vad.wasm`

### 6. Development vs Production

#### Development Mode
- Files served from `public/wasm/`
- Access via `http://localhost:3000/wasm/`

#### Production Mode
- Files copied to `build/wasm/`
- Access via your domain `/wasm/`

### 7. Network Issues

If using a CDN or remote server:
1. Verify WASM files are uploaded
2. Check file paths in the configuration
3. Ensure proper MIME types are set

### 8. Browser Compatibility

Ensure your browser supports:
- WebAssembly
- ES6 modules
- Fetch API

### 9. Debug Steps

1. **Check Network Tab**: Look for failed requests to WASM files
2. **Console Errors**: Check for JavaScript errors
3. **File Access**: Try accessing WASM files directly in browser
4. **Module Loading**: Verify `window.createVADModule` is available

### 10. Alternative Loading Method

If automatic loading fails, try manual loading:

```javascript
// In browser console
const script = document.createElement('script');
script.src = '/wasm/ten_vad.js';
script.onload = () => console.log('WASM loaded');
document.head.appendChild(script);
```

### 11. Environment Variables

For production deployments, ensure:
- `PUBLIC_URL` is set correctly
- WASM files are in the correct location
- Server is configured to serve static files

### 12. Contact Support

If issues persist:
1. Check browser console for detailed error messages
2. Verify all file paths and permissions
3. Test with different browsers
4. Check network connectivity and firewall settings 