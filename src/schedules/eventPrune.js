const cron = require("node-cron");
const Event = require("../models/Event");
async function pruneOldEvents() {
  try {
    const oneDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Event.deleteMany({ timestamp: { $lt: oneDayAgo } });
    console.log(`Pruned ${result.deletedCount} old events`);
    await global.logEvent("PRUNE_EVENTS_SUCCESS", {
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error pruning old events:", error);
    await global.logEvent("PRUNE_EVENTS_FAIL", { error: error.message });
  }
}

cron.schedule("0 0 */12 * * *", async () => {
  console.log("Running event prune cron job");
  await pruneOldEvents();
});
