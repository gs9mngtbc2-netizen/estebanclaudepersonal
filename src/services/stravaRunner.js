/**
 * Strava artifact runner — executed by Claude via MCP.
 *
 * Claude calls this logic manually each week:
 * 1. Fetch activities for the past 7 days via MCP (all sport types)
 * 2. For each activity, fetch performance data (HR, watts, segments)
 * 3. POST /artifacts/strava-weekly/output with the enriched payload
 *
 * Output schema per activity:
 * {
 *   id, name, type, date,
 *   distanceKm, movingTimeMin, avgSpeedKmh, maxSpeedKmh,
 *   calories, elevationM, kudos, prs,
 *   performance: {
 *     hasHeartrate, hasDeviceWatts,
 *     avgHeartrate, maxHeartrate,   -- null if no HR sensor
 *     avgWatts, avgCadence,         -- null if no power meter
 *     powerBests: { 5s, 15s, 30s, 1min, 5min, 10min, 20min, 1hr },
 *     topSegments: [{ name, distanceKm, elevM, avgWatts, avgHr }]
 *   }
 * }
 *
 * Supported sport_types: Ride, VirtualRide, Run, TrailRun, Walk, Hike, ...
 */

module.exports = { description: 'See file comments — executed interactively by Claude.' };
