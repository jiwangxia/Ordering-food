exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'joinSpace cloud function boundary is ready. Validate invite_code and create space_members record here.',
    input: event,
  };
};
