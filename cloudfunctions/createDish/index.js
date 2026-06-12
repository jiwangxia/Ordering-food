exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'createDish boundary is ready. Validate membership and create dishes record here.',
    input: event,
  };
};
