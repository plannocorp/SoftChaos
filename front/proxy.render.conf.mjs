const renderTarget = 'https://softchaos-backend.onrender.com';

function stripOrigin(proxy) {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.removeHeader('origin');
  });
}

export default {
  '/api': {
    target: renderTarget,
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    configure: stripOrigin,
  },
  '/uploads': {
    target: renderTarget,
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    configure: stripOrigin,
  },
};
