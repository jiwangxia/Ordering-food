exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'submitMenuSession boundary is ready. Generate orders and order_versions snapshot here.',
    input: event,
  };
};
