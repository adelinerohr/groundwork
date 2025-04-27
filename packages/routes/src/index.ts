// Convention:
// - Everything lowercase is an object
// - Everything uppercase is a string (the route)

import { keys } from '../keys.js';

export const baseUrl = {
  Dashboard: keys().NEXT_PUBLIC_DASHBOARD_URL,
  Marketing: keys().NEXT_PUBLIC_MARKETING_URL,
  PublicApi: keys().NEXT_PUBLIC_PUBLIC_API_URL
} as const;

export const routes = {
  marketing: {
    Api: `${baseUrl.Marketing}/api`,
    Blog: `${baseUrl.Marketing}/blog`,
    Careers: `${baseUrl.Marketing}/careers`,
    Contact: `${baseUrl.Marketing}/contact`,
    CookiePolicy: `${baseUrl.Marketing}/cookie-policy`,
    Docs: `${baseUrl.Marketing}/docs`,
    Index: `${baseUrl.Marketing}/`,
    Pricing: `${baseUrl.Marketing}/pricing`,
    PrivacyPolicy: `${baseUrl.Marketing}/privacy-policy`,
    Roadmap: 'https://achromatic.canny.io',
    Story: `${baseUrl.Marketing}/story`,
    TermsOfUse: `${baseUrl.Marketing}/terms-of-use`
  }
} as const;

export function getPathname(route: string, baseUrl: string): string {
  return new URL(route, baseUrl).pathname;
}
