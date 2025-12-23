/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // ... 위 iframe 설정 ...
      {
        // API 라우트에만 적용
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://zucchinicorp.com' }, // 👈 내 실제 배포 도메인만 허용
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
