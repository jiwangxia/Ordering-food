exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'addDishToMenu boundary is ready. Create menu_item_entries batch records here.',
    input: event,
  };
};
