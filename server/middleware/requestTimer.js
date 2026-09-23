// Logs method/URL/status/duration for every request, measured from the
// moment Express starts handling it to when the response is flushed — this
// is server-side processing time only, so it can be compared against what
// the browser's Network tab shows (network + queueing time) to tell apart
// "the server was slow" from "something between the browser and the server
// was slow" (CloudLinux I/O throttling, connection queueing, etc).
// Only logs requests slower than this -- on shared hosting with a metered
// I/O quota, writing a line to disk for every single request (including the
// 60-second cron ping and 5-minute UptimeRobot checks) is itself real disk
// I/O that adds up over a day. Slow requests are the only ones worth a
// permanent record; fast ones would just be noise.
const SLOW_THRESHOLD_MS = 500;

const requestTimer = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    if (ms >= SLOW_THRESHOLD_MS) {
      console.log(`[timing] SLOW ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
    }
  });
  next();
};

export default requestTimer;
