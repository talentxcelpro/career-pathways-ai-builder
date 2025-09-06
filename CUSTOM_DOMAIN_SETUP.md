# Custom Domain Setup for TalentXcel Storage

To make images show `talentxcel.in` instead of the Supabase storage URL, you need to set up a custom subdomain for your storage.

## Step 1: Set up DNS for Storage Subdomain

Add the following DNS records to your domain registrar:

### CNAME Record for Storage
- **Type**: CNAME
- **Name**: `cdn` (this creates `cdn.talentxcel.in`)
- **Value**: `dthlgsnakhoftinssokm.supabase.co`
- **TTL**: 3600 (or automatic)

### Alternative: A Record (if CNAME doesn't work)
- **Type**: A
- **Name**: `cdn`
- **Value**: `185.158.133.1` (Lovable's IP)
- **TTL**: 3600

## Step 2: Configure Edge Function Domain

Since we're using an edge function to proxy storage requests, you'll also need:

### CNAME for Edge Function
- **Type**: CNAME  
- **Name**: `cdn`
- **Value**: Your Lovable project domain (e.g., `your-project.lovableproject.com`)

## Step 3: Verify Setup

After DNS propagation (24-48 hours), verify:

1. Visit `https://cdn.talentxcel.in/post-media/test-path` - should proxy to storage
2. Images in your app should now show `cdn.talentxcel.in` instead of Supabase URLs

## How It Works

1. **Code changes**: Updated all storage URL generation to use `cdn.talentxcel.in`
2. **Edge function**: Created `storage-proxy` function to handle requests to custom domain
3. **DNS routing**: Routes `cdn.talentxcel.in` requests to the proxy function
4. **Proxy**: Function fetches from Supabase storage and returns with proper headers

## Files Modified

- `src/utils/storage.ts` - Storage utility with custom domain support
- `src/components/mobile/MobileCreatePost.tsx` - Uses custom URLs
- `src/components/posts/CreatePost.tsx` - Uses custom URLs  
- `src/components/posts/EnhancedCreatePost.tsx` - Uses custom URLs
- `src/components/posts/EnhancedMediaUpload.tsx` - Uses custom URLs
- `supabase/functions/storage-proxy/index.ts` - Proxy function

## Testing

You can test the proxy function locally by visiting URLs like:
- `https://cdn.talentxcel.in/post-media/your-file-path`

The function will automatically proxy to the correct Supabase storage URL and return the file with proper headers and caching.

## Troubleshooting

- **DNS not resolving**: Wait 24-48 hours for propagation
- **SSL certificate issues**: Let's Encrypt will auto-provision after DNS is working
- **404 errors**: Check that the edge function is deployed and DNS points correctly
- **CORS issues**: The proxy function includes proper CORS headers