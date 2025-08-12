import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { defaultRateLimiter } from '@/lib/rateLimiter';
import { defaultRetryMechanism } from '@/lib/retryMechanism';
import { defaultLogger } from '@/lib/logger';
import { sanitizeImageUrl, isImageKitUrl } from '@/lib/utils';

// Configuration from environment variables
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Retry configuration - set to false to avoid unwanted billing charges
// The errors we've encountered are related to API response interpretation, not Replicate API failures
const ENABLE_RETRY = false;

// Initialize Replicate client
const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

// Face-swap model identifier
const FACE_SWAP_MODEL = 'cdingram/face-swap:d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111';

// ImageKit transformation string from environment variable
const IMAGEKIT_TRANSFORMATIONS = process.env.IMAGEKIT_TRANSFORMATIONS || '/tr:w-600,h-800,e-contrast,e-sharpen,c-at_max:b-20_FFFFFF:b-2_000000:l-text,i-CHICBYSALLY,ff-Audiowide,fs-18,co-FFFFFF,lx-bh_mul_0.65,ly-bh_mul_0.9,l-end:l-text,i-stylecard%20by,ff-Audiowide,fs-12,co-FFFFFF,lx-bh_mul_0.7,ly-bh_mul_0.87,l-end';

// Apply ImageKit transformations to URL
const applyImageKitTransformations = (url: string): string => {
  if (isImageKitUrl(url)) {
    return url + IMAGEKIT_TRANSFORMATIONS;
  }
  return url;
};

export async function POST(request: NextRequest) {
  try {
    defaultLogger.info('Starting face-swap API request');
    
    // Parse request body
    const body = await request.json();
    const { inputImage, swapImage } = body;
    
    defaultLogger.info('Received face-swap request', { inputImage, swapImage });
    
    // Validate API token
    if (!REPLICATE_API_TOKEN) {
      const error = new Error('Replicate API token is not configured');
      defaultLogger.error('API token missing', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (REPLICATE_API_TOKEN.length < 10) {
      const error = new Error('Replicate API token appears to be invalid');
      defaultLogger.error('API token invalid', { error: error.message, tokenLength: REPLICATE_API_TOKEN.length });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Validate input URLs
    if (!inputImage || !swapImage) {
      const error = new Error('Both inputImage and swapImage are required');
      defaultLogger.error('Missing input URLs', { 
        inputImage: inputImage ? 'present' : 'missing',
        swapImage: swapImage ? 'present' : 'missing'
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Validate URL formats
    try {
      // Check if inputImage is a data URL or regular URL
      if (inputImage.startsWith('data:')) {
        defaultLogger.info('Input image is a data URL', { 
          dataUrlLength: inputImage.length,
          dataUrlType: inputImage.split(';')[0].split(':')[1] || 'unknown'
        });
      } else {
        new URL(inputImage);
      }
      
      // Check if swapImage is a data URL or regular URL
      if (swapImage.startsWith('data:')) {
        defaultLogger.info('Swap image is a data URL', { 
          dataUrlLength: swapImage.length,
          dataUrlType: swapImage.split(';')[0].split(':')[1] || 'unknown'
        });
      } else {
        new URL(swapImage);
      }
    } catch (urlError) {
      const error = new Error('Invalid image URL format');
      defaultLogger.error('URL validation failed', { 
        inputImage: inputImage.startsWith('data:') ? 'data URL (length: ' + inputImage.length + ')' : inputImage,
        swapImage: swapImage.startsWith('data:') ? 'data URL (length: ' + swapImage.length + ')' : swapImage,
        urlError: urlError instanceof Error ? urlError.message : 'Unknown URL error'
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Check rate limit
    if (!defaultRateLimiter.canMakeRequest()) {
      const error = new Error('Rate limit exceeded. Please try again later.');
      const status = defaultRateLimiter.getStatus();
      defaultLogger.error('Rate limit exceeded', { 
        maxRequests: status.maxRequests,
        windowSize: '60000ms',
        remainingRequests: status.remainingRequests,
        resetTime: status.resetTime
      });
      return NextResponse.json({ 
        error: error.message,
        rateLimitStatus: status
      }, { status: 429 });
    }
    
    // Sanitize URLs to remove query parameters before sending to Replicate
    const sanitizedInputImage = sanitizeImageUrl(inputImage);
    const sanitizedSwapImage = sanitizeImageUrl(swapImage);
    
    // Apply ImageKit transformations only to input image (reference image)
    // Swap image (user uploaded photo) should remain as-is (compressed base64)
    const transformedInputImage = applyImageKitTransformations(sanitizedInputImage);
    
    if (isImageKitUrl(inputImage)) {
      defaultLogger.info('Applied ImageKit transformations to input image', { 
        originalUrl: inputImage,
        sanitizedUrl: sanitizedInputImage,
        transformedUrl: transformedInputImage,
        transformations: IMAGEKIT_TRANSFORMATIONS
      });
    } else {
      defaultLogger.info('Input image is not an ImageKit URL, skipping transformations', { 
        inputImageUrl: inputImage,
        sanitizedUrl: sanitizedInputImage
      });
    }
    
    // Log swap image handling (should be base64 data URL from compressed upload)
    if (sanitizedSwapImage.startsWith('data:')) {
      defaultLogger.info('Swap image is base64 data URL (compressed upload)', { 
        dataUrlLength: sanitizedSwapImage.length,
        dataUrlType: sanitizedSwapImage.split(';')[0].split(':')[1] || 'unknown'
      });
    } else {
      defaultLogger.info('Swap image is not base64 data URL', { 
        swapImageUrl: sanitizedSwapImage,
        sanitizedUrl: sanitizedSwapImage
      });
    }
    
    // Prepare input for Replicate API
    const apiInput = {
      input_image: transformedInputImage,
      swap_image: sanitizedSwapImage  // Use sanitized but NOT transformed swap image
    };
    
    defaultLogger.info('Calling Replicate API', { model: FACE_SWAP_MODEL, input: apiInput, retryEnabled: ENABLE_RETRY });
    
    // Call Replicate API - only use retry if explicitly enabled
    let output;
    if (ENABLE_RETRY) {
      defaultLogger.info('Using retry mechanism for Replicate API call');
      output = await defaultRetryMechanism.execute(async () => {
        return await replicate.run(FACE_SWAP_MODEL, { input: apiInput });
      });
    } else {
      defaultLogger.info('Making direct Replicate API call (retry disabled)');
      output = await replicate.run(FACE_SWAP_MODEL, { input: apiInput });
    }
    
    defaultLogger.info('Face-swap completed successfully', { output });
    
    // Validate the output
    if (!output) {
      const error = new Error('Replicate API returned empty output');
      defaultLogger.error('Empty API response', { output });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Return the output
    // Handle both cases: when output is an object with url() method and when it's a direct URL string
    let url: string;
    if (typeof output === 'object' && output !== null && 'url' in output && typeof (output as { url: () => string }).url === 'function') {
      const urlResult = (output as { url: () => string | URL }).url();
      
      // Handle different types of url() method results
      if (typeof urlResult === 'string') {
        url = urlResult;
      } else if (urlResult && typeof urlResult === 'object' && 'href' in urlResult && typeof (urlResult as { href: string }).href === 'string') {
        // Handle URL object case (e.g., when url() returns a URL object)
        url = (urlResult as { href: string }).href;
        defaultLogger.info('Extracted URL from URL object', { 
          urlResultType: typeof urlResult,
          extractedUrl: url
        });
      } else {
        const error = new Error('API url() method did not return a string or URL object');
        defaultLogger.error('Invalid URL method result', { 
          urlResultType: typeof urlResult,
          urlResult: urlResult
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (typeof output === 'string') {
      url = output;
    } else {
      const error = new Error('Unexpected API response format');
      defaultLogger.error('Invalid API response format', { 
        outputType: typeof output,
        output: output
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Validate the URL
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      const error = new Error('Invalid image URL returned from API');
      defaultLogger.error('Invalid URL in API response', { 
        url: url,
        urlType: typeof url,
        urlLength: url ? url.length : 0
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    defaultLogger.info('Successfully extracted image URL', { url });
    
    // Return the successful response
    return NextResponse.json({ 
      url,
      success: true,
      rateLimitStatus: defaultRateLimiter.getStatus()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    defaultLogger.error('Face-swap API failed', { 
      error: errorMessage,
      stack: errorStack,
      apiToken: REPLICATE_API_TOKEN ? 'Token present' : 'Token missing',
      model: FACE_SWAP_MODEL
    });
    
    return NextResponse.json({ 
      error: 'There is issue creating StyleCard - Please try later.',
      originalError: errorMessage
    }, { status: 500 });
  }
}
