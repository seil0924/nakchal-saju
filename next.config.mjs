/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },                         // 클릭재킹 방지
  { key: 'X-Content-Type-Options', value: 'nosniff' },                     // MIME 스니핑 방지
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },    // 리퍼러 최소화
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }, // HTTPS 강제
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=(self)' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
export default nextConfig;
