exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'updateMyMenuItemQuantity boundary is ready. Only mutate current user entries here.',
    input: event,
  };
};
