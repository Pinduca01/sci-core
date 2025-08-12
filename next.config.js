/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas para resolver problemas de CSS e hot reload
  swcMinify: true,
  reactStrictMode: true,
  
  // Configurações experimentais
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: [],
  },
  
  // Configurações de webpack para resolver problemas de módulos
  webpack: (config, { isServer, dev }) => {
    // Configurações apenas para o cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Configurações para desenvolvimento
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  
  // Configurações de headers para resolver problemas de CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig