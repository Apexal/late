/* eslint-disable no-undef */
/* eslint-disable no-console */

// CHANGE THIS VALUE BEFORE EVERY DEPLOY
const LATEST_VERSION = 'v0.2.0'

workbox.precaching.cleanupOutdatedCaches()

workbox.core.setCacheNameDetails({
  prefix: 'late'
})

self.addEventListener('activate', async event => {
  console.log(`%c ${LATEST_VERSION} `, 'background: #ddd; color: #0000ff')
  if (caches) {
    const keys = await caches.keys()

    for (const key of keys) {
      if (key.indexOf('late-precache') < -1) {
        await caches.delete(key)
        console.log(`%c Cleared ${key}`, 'background: #333; color: #ff0000')
      } else {
        const cache = await caches.open(key)
        const res = cache.match('version')
        if (!res) {
          cache.put('version', new Response(LATEST_VERSION, { status: 200, statusText: LATEST_VERSION }))
        } else if (res.statusText !== LATEST_VERSION) {
          await caches.delete(key)
          console.log(`%c Cleared Cache ${LATEST_VERSION}`, 'background: #333; color: #ff0000')
        } else {
          console.log(`%c Great you have the latest version ${LATEST_VERSION}`, 'background: #333; color: #00ff00')
        }
      }
    }
  }
})

workbox.core.skipWaiting()
workbox.core.clientsClaim()

self.__precacheManifest = [].concat(self.__precacheManifest || [])
workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

/* The RPI academic calendar rarely changes... */
workbox.routing.registerRoute(
  '/api/integrations/academiccalendar',
  new workbox.strategies.CacheFirst()
)

/* Announcements aren't the most pressing so they can update in the background */
workbox.routing.registerRoute(
  '/api/announcements',
  new workbox.strategies.StaleWhileRevalidate()
)

workbox.routing.registerRoute(
  new RegExp('/api(/[0-9a-zA-Z]+)+'),
  new workbox.strategies.NetworkFirst()
)
