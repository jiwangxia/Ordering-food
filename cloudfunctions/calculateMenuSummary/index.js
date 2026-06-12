const { buildMenuSummary } = require('./summary');

exports.main = async (event) => {
  const summary = buildMenuSummary({
    dishes: event.dishes || [],
    entries: event.entries || [],
    confirmations: event.confirmations || [],
  });

  return { ok: true, data: summary };
};
