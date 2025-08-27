import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins for API access
const ALLOWED_ORIGINS = [
  'http://localhost:3000', // Development
  'http://localhost:3001', // Alternative dev port
  'https://your-domain.com', // Production - replace with your actual domain
];

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Validates if the request origin is allowed
 */
function isAllowedOrigin(request: NextRequest): boolean {
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
function createUnauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Access denied. This API is only accessible from authorized origins.',
      timestamp: new Date(),
      data: null,
    },
    { status: 403 }
  );
}

/**
 * Creates a rate limit exceeded response
 */
function createRateLimitResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      timestamp: new Date(),
      data: null,
    },
    { status: 429 }
  );
}

/**
 * Simple rate limiting implementation
 */
function checkRateLimit(request: NextRequest): boolean {
  const clientId = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const now = Date.now();
  
  const rateLimit = rateLimitMap.get(clientId);
  
  if (!rateLimit || now > rateLimit.resetTime) {
    // Reset or create new rate limit entry
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }
  
  if (rateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  rateLimit.count++;
  return true;
}

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Check rate limiting first
    if (!checkRateLimit(request)) {
      return createRateLimitResponse();
    }
    
    // Validate request origin
    if (!isAllowedOrigin(request)) {
      return createUnauthorizedResponse();
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
