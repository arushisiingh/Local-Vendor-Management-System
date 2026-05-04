function calculateCancellationBreakdown(order) {
  const now = Date.now();
  const placedAt = order.createdAt ? new Date(order.createdAt).getTime() : now;
  const minutesSincePlaced = Math.max(0, Math.round((now - placedAt) / 60000));

  let feePercent = 8;
  let reason = "Early cancellation fee";

  if (minutesSincePlaced >= 30 && minutesSincePlaced < 90) {
    feePercent = 18;
    reason = "Standard cancellation fee";
  }

  if (minutesSincePlaced >= 90 || ["Accepted", "Out for Delivery"].includes(order.status)) {
    feePercent = 35;
    reason = "Late cancellation fee";
  }

  if (["Delivered", "Completed"].includes(order.status)) {
    feePercent = 100;
    reason = "Delivered orders are not refundable";
  }

  const feeAmount = Math.min(Number(order.total || 0), Math.round(Number(order.total || 0) * (feePercent / 100)));
  const refundAmount = Math.max(0, Number(order.total || 0) - feeAmount);

  return {
    minutesSincePlaced,
    feePercent,
    feeAmount,
    refundAmount,
    reason
  };
}

module.exports = { calculateCancellationBreakdown };
