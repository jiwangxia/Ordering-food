const assert = require('node:assert/strict');
const test = require('node:test');

const {
  allocateEntries,
  buildMenuSummary,
} = require('../miniprogram/utils/summary');

test('allocateEntries assigns limited quantity by entry creation time', () => {
  const entries = [
    { _id: 'late', user_id: 'user-b', quantity: 2, created_at: '2026-06-13T19:03:00.000Z' },
    { _id: 'early', user_id: 'user-a', quantity: 1, created_at: '2026-06-13T19:00:00.000Z' },
  ];

  const result = allocateEntries(entries, 2);

  assert.deepEqual(result.entries, [
    { entry_id: 'early', user_id: 'user-a', quantity: 1, effective_quantity: 1 },
    { entry_id: 'late', user_id: 'user-b', quantity: 2, effective_quantity: 1 },
  ]);
  assert.deepEqual(result.by_user, { 'user-a': 1, 'user-b': 1 });
  assert.equal(result.total_effective_quantity, 2);
});

test('buildMenuSummary merges dishes and calculates original and final totals', () => {
  const dishes = [
    { _id: 'dish-egg', name: '番茄炒蛋', price: 12, image_file_id: 'cloud://egg' },
    { _id: 'dish-wing', name: '可乐鸡翅', price: 20, image_file_id: 'cloud://wing' },
  ];
  const entries = [
    { _id: 'entry-1', dish_id: 'dish-egg', user_id: 'user-a', quantity: 2, created_at: '2026-06-13T19:00:00.000Z' },
    { _id: 'entry-2', dish_id: 'dish-egg', user_id: 'user-b', quantity: 1, created_at: '2026-06-13T19:01:00.000Z' },
    { _id: 'entry-3', dish_id: 'dish-wing', user_id: 'user-a', quantity: 2, created_at: '2026-06-13T19:02:00.000Z' },
    { _id: 'entry-4', dish_id: 'dish-wing', user_id: 'user-b', quantity: 1, created_at: '2026-06-13T19:03:00.000Z' },
  ];
  const confirmations = [
    { dish_id: 'dish-wing', status: 'partial', available_quantity: 1, note: '只够一份' },
  ];

  const summary = buildMenuSummary({ dishes, entries, confirmations });

  assert.equal(summary.original.total_quantity, 6);
  assert.equal(summary.original.total_amount, 96);
  assert.deepEqual(summary.original.by_user, {
    'user-a': { quantity: 4, amount: 64 },
    'user-b': { quantity: 2, amount: 32 },
  });
  assert.equal(summary.final.total_quantity, 4);
  assert.equal(summary.final.total_amount, 56);
  assert.deepEqual(summary.final.by_user, {
    'user-a': { quantity: 3, amount: 44 },
    'user-b': { quantity: 1, amount: 12 },
  });
  assert.equal(summary.items.length, 2);
  assert.equal(summary.items[1].final_total_quantity, 1);
});
