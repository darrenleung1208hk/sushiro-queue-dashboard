import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins for API access
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
  'http://localhost:3000', // Default fallback for development
];

// Rate limiting configuration
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000'); // 1 minute default
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'); // Max requests per window
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
      message:
        'Access denied. This API is only accessible from authorized origins.',
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
  const clientId =
    request.headers.get('x-forwarded-for') ||
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
  console.log('🔒 Middleware running for:', request.nextUrl.pathname);
  console.log('🌍 Allowed origins:', ALLOWED_ORIGINS);

  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('📡 API route detected:', request.nextUrl.pathname);
    console.log('🌐 Origin:', request.headers.get('origin'));
    console.log('📄 Referer:', request.headers.get('referer'));

    // Check rate limiting first
    if (!checkRateLimit(request)) {
      console.log('⏰ Rate limit exceeded');
      return createRateLimitResponse();
    }

    // Validate request origin
    if (!isAllowedOrigin(request)) {
      console.log('🚫 Unauthorized origin');
      return createUnauthorizedResponse();
    }

    console.log('✅ Request authorized');
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
