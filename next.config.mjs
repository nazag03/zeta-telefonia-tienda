
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["sharp", "bcryptjs"],
  experimental: {
    
    serverActions: { bodySizeLimit: "25mb" },
    
    proxyClientMaxBodySize: "25mb",
    
    
    imgOptConcurrency: 1,
    imgOptOperationCache: false,
    imgOptSequentialRead: true,
  },
  images: {
    
    
    
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    
    
    formats: ["image/webp"],
    
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
