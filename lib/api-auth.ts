/**
 * API Key Authentication Utilities
 */

/**
 * Validates API key from request headers
 */
export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  const requiredApiKey = process.env.API_SECRET_KEY;
  
  // If no API key is configured, skip validation
  if (!requiredApiKey) {
    console.warn('⚠️ No API_SECRET_KEY configured - skipping API key validation');
    return true;
  }
  
  if (!apiKey) {
    console.log('🔑 No API key provided in request');
    return false;
  }
  
  const isValid = apiKey === requiredApiKey;
  console.log(`🔑 API key validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  
  return isValid;
}

/**
 * Creates a standardized unauthorized response
 */
export function createUnauthorizedResponse<T = any>() {
  return {
    success: false,
    error: 'UNAUTHORIZED',
    message: 'Access denied. Valid API key required.',
    timestamp: new Date(),
    data: [] as T,
  };
}

/**
 * Creates a rate limit exceeded response
 */
export function createRateLimitResponse<T = any>() {
  return {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
    timestamp: new Date(),
    data: [] as T,
  };
}

/**
 * Simple in-memory rate limiting
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(request: Request): boolean {
  const clientId = 
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '60000'); // 1 minute
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  
  const rateLimit = rateLimitMap.get(clientId);
  
  if (!rateLimit || now > rateLimit.resetTime) {
    // Reset or create new rate limit entry
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (rateLimit.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  rateLimit.count++;
  return true;
}
