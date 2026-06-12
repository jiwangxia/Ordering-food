exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'createSpace cloud function boundary is ready. Connect CloudBase database before enabling writes.',
    input: event,
  };
};
