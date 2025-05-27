workbox.routing.registerRoute(
    ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'dynamic-content',
    })
);
