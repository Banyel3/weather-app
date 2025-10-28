# Geolocation Troubleshooting Guide

## Testing the "Use My Location" Feature

### Quick Test

1. **Start both servers:**

   ```bash
   npm run dev
   ```

2. **Open the app:**
   - Go to http://localhost:3000
   - Click "Use My Location"
   - Allow location permission when prompted

3. **Standalone Test Page:**
   - Open http://localhost:3000/geolocation-test.html
   - Click "Test Geolocation"
   - See detailed results

## Common Issues & Solutions

### 🔴 "Geolocation is not supported by your browser"

**Cause:** Browser doesn't support geolocation API  
**Solution:**

- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Update your browser to the latest version

---

### 🔴 "Please enable location permissions in your browser settings"

**Cause:** Location permission denied  
**Solutions:**

**Chrome:**

1. Click the lock icon (🔒) in address bar
2. Find "Location"
3. Change to "Allow"
4. Refresh page

**Firefox:**

1. Click the lock icon (🔒) in address bar
2. Click "More Information"
3. Go to Permissions tab
4. Find "Access Your Location"
5. Uncheck "Use Default" and check "Allow"

**Safari:**

1. Safari menu → Settings → Websites
2. Click "Location" in left sidebar
3. Find localhost:3000
4. Change to "Allow"

**Edge:**

1. Click the lock icon (🔒) in address bar
2. Find "Location permissions"
3. Change to "Allow"
4. Refresh page

---

### 🔴 "Location information is unavailable"

**Causes:**

- GPS/location services disabled on device
- Network issues preventing location detection
- Privacy settings blocking location

**Solutions:**

1. **Enable device location services:**
   - Windows: Settings → Privacy → Location → On
   - Mac: System Preferences → Security & Privacy → Location Services → On
   - Linux: Varies by distribution

2. **Check network connection** - Geolocation often uses network info

3. **Try disabling VPN** - VPNs can interfere with location detection

---

### 🔴 "Location request timed out"

**Cause:** Taking too long to get location  
**Solutions:**

- Try again (sometimes GPS needs time to acquire signal)
- Move near a window (better GPS signal)
- Check internet connection
- Restart browser

---

### 🔴 "Unable to fetch weather for your location"

**Cause:** Backend API error  
**Solutions:**

1. **Check backend is running:**

   ```bash
   # Should show both frontend and backend running
   npm run dev
   ```

2. **Verify backend URL:**
   - Check `apps/frontend/.env.local`
   - Should have: `NEXT_PUBLIC_API_URL=http://localhost:8000/api/weather`

3. **Test API directly:**

   ```bash
   curl "http://localhost:8000/api/weather/current?lat=40.7128&lon=-74.0060"
   ```

4. **Check CORS settings:**
   - Backend `apps/backend/config/settings.py`
   - Should include `http://localhost:3000` in `CORS_ALLOWED_ORIGINS`

---

### 🔴 Button does nothing when clicked

**Possible Causes:**

1. JavaScript error - Check browser console (F12)
2. Button disabled state stuck
3. React state issue

**Solutions:**

1. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for errors

2. **Hard refresh:**
   - Windows/Linux: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

3. **Clear cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Check "Cached images and files"

---

## HTTPS Requirement

⚠️ **Important:** In production, geolocation **requires HTTPS**

- Works on `localhost` with HTTP (for development)
- Production deployment must use HTTPS
- Browsers block geolocation on insecure origins

## Testing Checklist

Use this checklist to verify everything works:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] `.env.local` configured correctly
- [ ] Location services enabled on device
- [ ] Browser supports geolocation
- [ ] Location permission granted
- [ ] No VPN interfering
- [ ] CORS configured correctly
- [ ] API responds to test request

## Manual Testing

### Test with browser console:

```javascript
// Test geolocation API
navigator.geolocation.getCurrentPosition(
  (pos) => console.log("Success:", pos.coords),
  (err) => console.error("Error:", err)
);

// Test API fetch
fetch("http://localhost:8000/api/weather/current?lat=40.7128&lon=-74.0060")
  .then((r) => r.json())
  .then((d) => console.log("Weather:", d))
  .catch((e) => console.error("API Error:", e));
```

## Browser DevTools

### Check Network Requests:

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Use My Location"
4. Look for requests to `/api/weather/current`
5. Check status code (should be 200)
6. Check response data

### Check Console for Errors:

1. Open DevTools (F12)
2. Go to Console tab
3. Click "Use My Location"
4. Look for any error messages

## Debugging Output

The app logs useful info to console:

```javascript
// Success
console.log("Geolocation success:", { lat, lon });
console.log("Weather data:", weatherData);

// Errors
console.error("Geolocation error:", error);
console.error("API error:", error);
```

## Production Considerations

### For Deployment:

1. **Use HTTPS** - Required for geolocation in production
2. **Update API URL** - Change `NEXT_PUBLIC_API_URL` to production backend
3. **CORS** - Update backend CORS settings for production domain
4. **Error handling** - App has user-friendly error messages
5. **Timeout** - 10 second timeout configured
6. **High accuracy** - Enabled for better location precision

## Still Having Issues?

1. **Test with the standalone test page:**
   - http://localhost:3000/geolocation-test.html

2. **Check all services are running:**

   ```bash
   # From root
   npm run dev
   ```

3. **Verify environment variables:**

   ```bash
   # Frontend
   cat apps/frontend/.env.local

   # Backend
   cat apps/backend/.env
   ```

4. **Check browser compatibility:**
   - Use latest Chrome, Firefox, Safari, or Edge
   - Private/Incognito mode might block geolocation

5. **Review logs:**
   - Frontend: Browser console (F12)
   - Backend: Terminal where Django is running

## Example Working Flow

1. User clicks "Use My Location" ✅
2. Browser shows permission prompt 🔒
3. User clicks "Allow" ✅
4. Loading spinner shows "Getting location..." ⏳
5. Browser gets GPS coordinates 📍
6. Frontend calls backend API 🌐
7. Backend fetches from Open-Meteo ☁️
8. Weather data displayed 🌤️

If any step fails, check the corresponding section above!
