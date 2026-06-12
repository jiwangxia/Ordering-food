const SESSION_STATUS_TEXT = {
  draft: '点单中',
  submitted: '已提交',
  chef_confirming: '待厨师确认',
  chef_confirmed: '已确认',
  changed_after_confirmed: '有新变更',
  closed: '已关闭',
};

const CONFIRM_STATUS_TEXT = {
  available: '可做',
  partial: '部分可做',
  unavailable: '无货',
};

function sessionStatusText(status) {
  return SESSION_STATUS_TEXT[status] || status || '未知';
}

function confirmStatusText(status) {
  return CONFIRM_STATUS_TEXT[status] || '未确认';
}

module.exports = {
  sessionStatusText,
  confirmStatusText,
};
