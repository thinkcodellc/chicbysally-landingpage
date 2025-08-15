import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { defaultRateLimiter } from '@/lib/rateLimiter';
import { defaultRetryMechanism } from '@/lib/retryMechanism';
import { defaultLogger } from '@/lib/logger';
import { sanitizeImageUrl, isImageKitUrl } from '@/lib/utils';

// Configuration from environment variables
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Retry configuration - set to match client-side defaults
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '2');
const INITIAL_RETRY_DELAY_MS = parseInt(process.env.INITIAL_RETRY_DELAY_MS || '1000');
const BACKOFF_FACTOR = parseFloat(process.env.BACKOFF_FACTOR || '2');

// Rate limit configuration
const MAX_REQUESTS_PER_MINUTE = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '2');
const REQUEST_WINDOW_SIZE_MS = parseInt(process.env.REQUEST_WINDOW_SIZE_MS || '60000');

/**
 * POST /api/face-swap
 * Perform face-swap using Replicate API
 */
export async function POST(request: NextRequest) {
  try {
    defaultLogger.info('Face-swap API route called');
    
    // Parse request body
    const body = await request.json();
    const { inputImage, swapImage } = body;
    
    defaultLogger.info('Face-swap request received', { 
      inputImageType: typeof inputImage,
      swapImageType: typeof swapImage,
      inputImageLength: inputImage?.length,
      swapImageLength: swapImage?.length
    });
    
    // Validate input
    if (!inputImage || !swapImage) {
      const error = new Error('Both inputImage and swapImage are required');
      defaultLogger.error('Missing input images', { 
        inputImage: inputImage ? 'present' : 'missing',
        swapImage: swapImage ? 'present' : 'missing'
      });
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Validate URL formats
    try {
      new URL(inputImage);
      new URL(swapImage);
    } catch (urlError) {
      const error = new Error('Invalid image URL format');
      defaultLogger.error('URL validation failed', { 
        inputImage,
        swapImage,
        urlError: urlError instanceof Error ? urlError.message : 'Unknown URL error'
      });
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Check rate limit using server-side rate limiter
    if (!defaultRateLimiter.canMakeRequest()) {
      const error = new Error('Rate limit exceeded. Please try again later.');
      const status = defaultRateLimiter.getStatus();
      defaultLogger.error('Rate limit exceeded', { 
        maxRequests: status.maxRequests,
        windowSize: '60000ms',
        remainingRequests: status.remainingRequests,
        resetTime: status.resetTime
      });
      return NextResponse.json(
        { 
          error: error.message,
          rateLimitStatus: status
        },
        { status: 429 }
      );
    }
    
    // Initialize Replicate client
    if (!REPLICATE_API_TOKEN) {
      const error = new Error('Replicate API token not configured');
      defaultLogger.error('Missing Replicate API token');
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });
    
    defaultLogger.info('Calling Replicate API', { 
      inputImage: inputImage.substring(0, 100) + '...',
      swapImage: swapImage.substring(0, 100) + '...'
    });
    
    // Call Replicate API with retry mechanism
    const output = await defaultRetryMechanism.execute(async () => {
      // Use predictions.create and wait for completion to get proper response format
      const prediction = await replicate.predictions.create({
        version: "d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111",
        input: {
          swap_image: swapImage,
          input_image: inputImage
        }
      });
      
      // Wait for prediction to complete
      const result = await replicate.wait(prediction, { interval: 1000 });
      
      if (result.status === "failed") {
        throw new Error(`Replicate prediction failed: ${result.error || 'Unknown error'}`);
      }
      
      return result;
    });
    
    defaultLogger.info('Replicate API call completed successfully', { outputType: typeof output });
    
    // Validate the output
    if (!output) {
      const error = new Error('Replicate API returned no output');
      defaultLogger.error('Missing output from Replicate API');
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Handle the output format - extract URL from output field
    let resultUrl: string;
    if (typeof output === 'string') {
      resultUrl = output;
    } else if (typeof output === 'object' && output !== null && 'output' in output) {
      const outputObj = output as { output: string | string[] };
      if (Array.isArray(outputObj.output)) {
        resultUrl = outputObj.output[0]; // Take the first URL if it's an array
      } else {
        resultUrl = outputObj.output; // Use the string URL directly
      }
    } else {
      const error = new Error('Invalid output format from Replicate API - expected string URL or prediction object with output field');
      defaultLogger.error('Invalid output format', { outputType: typeof output, output });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Validate the result URL
    if (!resultUrl.startsWith('http')) {
      const error = new Error('Invalid image URL returned from Replicate API');
      defaultLogger.error('Invalid URL in Replicate API response', { url: resultUrl });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    defaultLogger.info('Successfully extracted image URL', { url: resultUrl });
    
    // Get current rate limit status
    const rateLimitStatus = defaultRateLimiter.getStatus();
    
    // Return success response
    return NextResponse.json({
      url: resultUrl,
      buffer: undefined, // We don't need to return the buffer since the URL is sufficient
      rateLimitStatus
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    defaultLogger.error('Face-swap API route failed', { 
      error: errorMessage,
      stack: errorStack
    });
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'There is issue creating StyleCard - Please try later.',
        details: {
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
