/**
 * IndexNow utility for submitting URLs to search engines
 * Documentation: https://www.indexnow.org/documentation
 */

const INDEXNOW_KEY = '59748a36d4494392a7d863abcf2d3b52';
const INDEXNOW_KEY_LOCATION = 'https://streamstickpro.com/59748a36d4494392a7d863abcf2d3b52.txt';
const SITE_URL = 'https://streamstickpro.com';
const INDEXNOW_API_URL = 'https://api.indexnow.org/IndexNow';

interface IndexNowResponse {
  success: boolean;
  message: string;
  status?: number;
}

/**
 * Submit URLs to IndexNow API
 * @param urls - Array of URLs to submit (can be relative or absolute)
 * @returns Promise with submission result
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResponse> {
  if (!urls || urls.length === 0) {
    return {
      success: false,
      message: 'No URLs provided',
    };
  }

  // Normalize URLs - ensure they're absolute
  const normalizedUrls = urls.map(url => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Ensure relative URLs start with /
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${SITE_URL}${normalizedPath}`;
  });

  try {
    const response = await fetch(INDEXNOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: normalizedUrls,
      }),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      return {
        success: true,
        message: `Successfully submitted ${urls.length} URL(s) to IndexNow`,
        status: response.status,
      };
    } else if (response.status === 400) {
      return {
        success: false,
        message: 'Bad request - Invalid format',
        status: response.status,
      };
    } else if (response.status === 403) {
      return {
        success: false,
        message: 'Forbidden - Key not valid. Please verify the key file is accessible at the key location.',
        status: response.status,
      };
    } else if (response.status === 422) {
      return {
        success: false,
        message: 'Unprocessable Entity - URLs do not belong to the host or key does not match schema',
        status: response.status,
      };
    } else if (response.status === 429) {
      return {
        success: false,
        message: 'Too Many Requests - Rate limit exceeded. Please wait before submitting again.',
        status: response.status,
      };
    } else {
      return {
        success: false,
        message: `IndexNow API returned status ${response.status}`,
        status: response.status,
      };
    }
  } catch (error: any) {
    console.error('IndexNow submission error:', error);
    return {
      success: false,
      message: `Failed to submit to IndexNow: ${error.message || 'Unknown error'}`,
    };
  }
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<IndexNowResponse> {
  return submitToIndexNow([url]);
}

/**
 * Submit product page URL to IndexNow
 * @param productSlug - Product slug (e.g., 'firestick-4k')
 */
export async function submitProductToIndexNow(productSlug: string): Promise<IndexNowResponse> {
  const productUrl = `/shop/${productSlug}`;
  return submitUrlToIndexNow(productUrl);
}

/**
 * Submit multiple product URLs at once
 */
export async function submitProductsToIndexNow(productSlugs: string[]): Promise<IndexNowResponse> {
  const productUrls = productSlugs.map(slug => `/shop/${slug}`);
  return submitToIndexNow(productUrls);
}

/**
 * Submit homepage and main pages to IndexNow
 */
export async function submitMainPagesToIndexNow(): Promise<IndexNowResponse> {
  const mainPages = [
    '/',
    '/shop',
    '/blog',
    '/terms',
    '/privacy',
    '/refund',
  ];
  return submitToIndexNow(mainPages);
}

