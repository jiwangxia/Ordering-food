exports.main = async (event) => {
  return {
    ok: false,
    code: 'NOT_CONNECTED',
    message: 'updateMemberRole boundary is ready. Owner permission check belongs here.',
    input: event,
  };
};
