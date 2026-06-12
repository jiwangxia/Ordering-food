exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'createMenuSession boundary is ready. Validate space membership and create menu_sessions record here.',
    input: event,
  };
};
