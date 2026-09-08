/**
 * Calculate mid-cycle plan upgrade/downgrade proration
 * @param {Object} params
 * @param {Object} params.oldPlan - Current plan object
 * @param {Object} params.newPlan - Target plan object
 * @param {Date} params.periodStart - Start date of current billing cycle
 * @param {Date} params.periodEnd - End date of current billing cycle
 * @param {Date} [params.now=new Date()] - Date of plan change
 * @returns {Object} Proration details containing unused value, new plan cost, net amount due in USD & INR, and audit notes
 */
const calculateProration = ({ oldPlan, newPlan, periodStart, periodEnd, now = new Date() }) => {
  const totalMs = new Date(periodEnd).getTime() - new Date(periodStart).getTime();
  const remainingMs = Math.max(0, new Date(periodEnd).getTime() - new Date(now).getTime());

  if (totalMs <= 0) {
    return {
      unusedOldPlanUSD: 0,
      unusedOldPlanINR: 0,
      costNewPlanUSD: newPlan.priceUSD || 0,
      costNewPlanINR: newPlan.priceINR || 0,
      prorationBalanceUSD: newPlan.priceUSD || 0,
      prorationBalanceINR: newPlan.priceINR || 0,
      remainingDays: 0,
      totalDays: 0,
      auditNote: 'Immediate plan switch at start of billing cycle.'
    };
  }

  const fractionRemaining = remainingMs / totalMs;
  const totalDays = Math.round(totalMs / (1000 * 60 * 60 * 24));
  const remainingDays = Math.round(remainingMs / (1000 * 60 * 60 * 24));

  const unusedOldPlanUSD = Number(((oldPlan.priceUSD || 0) * fractionRemaining).toFixed(2));
  const unusedOldPlanINR = Number(((oldPlan.priceINR || 0) * fractionRemaining).toFixed(2));

  const costNewPlanUSD = Number(((newPlan.priceUSD || 0) * fractionRemaining).toFixed(2));
  const costNewPlanINR = Number(((newPlan.priceINR || 0) * fractionRemaining).toFixed(2));

  const prorationBalanceUSD = Number((costNewPlanUSD - unusedOldPlanUSD).toFixed(2));
  const prorationBalanceINR = Number((costNewPlanINR - unusedOldPlanINR).toFixed(2));

  const action = prorationBalanceUSD >= 0 ? 'UPGRADE' : 'DOWNGRADE';
  const auditNote = `Mid-cycle ${action} from '${oldPlan.name}' to '${newPlan.name}'. ${remainingDays}/${totalDays} days remaining. Proration balance: USD $${prorationBalanceUSD} / INR ₹${prorationBalanceINR}.`;

  return {
    unusedOldPlanUSD,
    unusedOldPlanINR,
    costNewPlanUSD,
    costNewPlanINR,
    prorationBalanceUSD,
    prorationBalanceINR,
    remainingDays,
    totalDays,
    action,
    auditNote
  };
};

module.exports = {
  calculateProration
};
