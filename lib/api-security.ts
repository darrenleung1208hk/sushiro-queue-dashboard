/**
 * API Security utilities for protecting API endpoints
 */

// Allowed origins for API access
const ALLOWED_ORIGINS = [
  'http://localhost:3000', // Development
  'http://localhost:3001', // Alternative dev port
  'https://your-domain.com', // Production - replace with your actual domain
];

/**
 * Validates if the request origin is allowed
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow requests from the same origin (same-site requests)
  if (!origin && !referer) {
    return true;
  }
  
  // Check if origin is in allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // Check if referer is from allowed domain
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return ALLOWED_ORIGINS.some(allowedOrigin => {
        const allowedUrl = new URL(allowedOrigin);
        return refererUrl.hostname === allowedUrl.hostname;
      });
    } catch {
      return false;
    }
  }
  
  return false;
}

/**
 * Creates a standardized unauthorized response
 */
export function createUnauthorizedResponse<T = unknown>(): {
  success: false;
  error: string;
  message: string;
  timestamp: Date;
  data: T;
} {
  return {
    success: false,
    error: 'UNAUTHORIZED',
    message: 'Access denied. This API is only accessible from authorized origins.',
    timestamp: new Date(),
    data: [] as T,
  };
}

/**
 * Validates API key if required
 */
export function validateApiKey(request: Request, requiredApiKey?: string): boolean {
  if (!requiredApiKey) return true;
  
  const apiKey = request.headers.get('x-api-key');
  return apiKey === requiredApiKey;
}

/**
 * Comprehensive API security check
 */
export function validateApiRequest(request: Request, options?: {
  requireApiKey?: string;
  allowSameOrigin?: boolean;
}): { isValid: boolean; error?: string } {
  // Check origin
  if (!isAllowedOrigin(request)) {
    return { isValid: false, error: 'UNAUTHORIZED_ORIGIN' };
  }
  
  // Check API key if required
  if (options?.requireApiKey && !validateApiKey(request, options.requireApiKey)) {
    return { isValid: false, error: 'INVALID_API_KEY' };
  }
  
  return { isValid: true };
}
