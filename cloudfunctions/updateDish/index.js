exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'updateDish boundary is ready. Uploader permission check belongs here.',
    input: event,
  };
};
