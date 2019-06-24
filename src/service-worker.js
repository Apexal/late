/* eslint-disable no-undef */

/* The RPI academic calendar rarely changes... */
workbox.routing.registerRoute(
  '/api/integrations/academiccalendar',
  new workbox.strategies.CacheFirst()
);

/* Announcements aren't the most pressing so they can update in the background */
workbox.routing.registerRoute(
  '/api/announcements',
  new workbox.strategies.StaleWhileRevalidate()
);

workbox.routing.registerRoute(
  new RegExp('/api(/[0-9a-zA-Z]+)+'),
  new workbox.strategies.NetworkFirst()
);
