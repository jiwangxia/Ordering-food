exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'confirmDishAvailability boundary is ready. Chef and owner permission checks belong here.',
    input: event,
  };
};
