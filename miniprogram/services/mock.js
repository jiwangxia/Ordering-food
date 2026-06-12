const now = '2026-06-13T19:00:00.000Z';

const users = [
  { _id: 'user-a', nickname: '阿夏', avatar_url: '' },
  { _id: 'user-b', nickname: '小陆', avatar_url: '' },
  { _id: 'user-c', nickname: '南星', avatar_url: '' },
];

const spaces = [
  {
    _id: 'space-1',
    name: '周末饭局',
    description: '朋友共享菜单试用空间',
    currency_name: '饭票',
    owner_id: 'user-a',
    invite_code: 'MENU88',
  },
];

const members = [
  { _id: 'member-1', space_id: 'space-1', user_id: 'user-a', role: 'owner' },
  { _id: 'member-2', space_id: 'space-1', user_id: 'user-b', role: 'chef' },
  { _id: 'member-3', space_id: 'space-1', user_id: 'user-c', role: 'member' },
];

const dishes = [
  {
    _id: 'dish-egg',
    space_id: 'space-1',
    created_by: 'user-a',
    name: '番茄炒蛋',
    image_file_id: '',
    price: 12,
    ingredients: '番茄、鸡蛋、葱',
    description: '酸甜口，适合配米饭。',
    is_active: true,
  },
  {
    _id: 'dish-wing',
    space_id: 'space-1',
    created_by: 'user-b',
    name: '可乐鸡翅',
    image_file_id: '',
    price: 20,
    ingredients: '鸡翅、可乐、生抽',
    description: '偏甜口，孩子也会喜欢。',
    is_active: true,
  },
];

const menuSessions = [
  {
    _id: 'session-1',
    space_id: 'space-1',
    name: '周六晚饭',
    description: '先点菜，厨师晚点确认。',
    status: 'chef_confirming',
    created_by: 'user-a',
    submitted_by: 'user-a',
    submitted_at: now,
    current_order_version: 1,
  },
];

const menuItemEntries = [
  { _id: 'entry-1', space_id: 'space-1', menu_session_id: 'session-1', dish_id: 'dish-egg', user_id: 'user-a', quantity: 2, created_at: '2026-06-13T19:00:00.000Z' },
  { _id: 'entry-2', space_id: 'space-1', menu_session_id: 'session-1', dish_id: 'dish-egg', user_id: 'user-b', quantity: 1, created_at: '2026-06-13T19:01:00.000Z' },
  { _id: 'entry-3', space_id: 'space-1', menu_session_id: 'session-1', dish_id: 'dish-wing', user_id: 'user-a', quantity: 2, created_at: '2026-06-13T19:02:00.000Z' },
  { _id: 'entry-4', space_id: 'space-1', menu_session_id: 'session-1', dish_id: 'dish-wing', user_id: 'user-b', quantity: 1, created_at: '2026-06-13T19:03:00.000Z' },
];

const chefConfirmations = [
  { _id: 'confirm-1', space_id: 'space-1', menu_session_id: 'session-1', dish_id: 'dish-wing', status: 'partial', available_quantity: 1, note: '鸡翅只剩一份' },
];

const orders = [
  { _id: 'order-1', space_id: 'space-1', menu_session_id: 'session-1', latest_version: 1, status: 'active' },
];

const orderVersions = [
  { _id: 'version-1', space_id: 'space-1', order_id: 'order-1', menu_session_id: 'session-1', version_no: 1, created_by: 'user-a', created_at: now },
];

module.exports = {
  users,
  spaces,
  members,
  dishes,
  menuSessions,
  menuItemEntries,
  chefConfirmations,
  orders,
  orderVersions,
};
