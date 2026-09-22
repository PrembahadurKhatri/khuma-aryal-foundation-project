// Logs method/URL/status/duration for every request, measured from the
// moment Express starts handling it to when the response is flushed — this
// is server-side processing time only, so it can be compared against what
// the browser's Network tab shows (network + queueing time) to tell apart
// "the server was slow" from "something between the browser and the server
// was slow" (CloudLinux I/O throttling, connection queueing, etc).
const requestTimer = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`[timing] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
};

export default requestTimer;
