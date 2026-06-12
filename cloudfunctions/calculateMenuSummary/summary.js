function normalizeQuantity(value) {
  const quantity = Number(value || 0);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function sortEntriesByCreatedAt(entries) {
  return [...entries].sort((left, right) => {
    return new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime();
  });
}

function allocateEntries(entries, availableQuantity) {
  let remaining = normalizeQuantity(availableQuantity);
  const byUser = {};
  const allocatedEntries = sortEntriesByCreatedAt(entries)
    .filter((entry) => !entry.is_deleted)
    .map((entry) => {
      const quantity = normalizeQuantity(entry.quantity);
      const effectiveQuantity = Math.min(quantity, remaining);
      remaining -= effectiveQuantity;
      byUser[entry.user_id] = (byUser[entry.user_id] || 0) + effectiveQuantity;
      return {
        entry_id: entry._id,
        user_id: entry.user_id,
        quantity,
        effective_quantity: effectiveQuantity,
      };
    });

  return {
    entries: allocatedEntries,
    by_user: byUser,
    total_effective_quantity: allocatedEntries.reduce((total, entry) => total + entry.effective_quantity, 0),
  };
}

function addUserTotal(target, userId, quantity, price) {
  if (!target[userId]) {
    target[userId] = { quantity: 0, amount: 0 };
  }
  target[userId].quantity += quantity;
  target[userId].amount += quantity * price;
}

function getConfirmationForDish(confirmations, dishId, requestedQuantity) {
  const confirmation = confirmations.find((item) => item.dish_id === dishId);
  if (!confirmation) {
    return { dish_id: dishId, status: 'available', available_quantity: requestedQuantity, note: '' };
  }
  if (confirmation.status === 'unavailable') {
    return { ...confirmation, available_quantity: 0 };
  }
  if (confirmation.status === 'partial') {
    return { ...confirmation, available_quantity: normalizeQuantity(confirmation.available_quantity) };
  }
  return { ...confirmation, status: 'available', available_quantity: requestedQuantity };
}

function buildMenuSummary({ dishes = [], entries = [], confirmations = [] }) {
  const activeEntries = entries.filter((entry) => !entry.is_deleted && normalizeQuantity(entry.quantity) > 0);
  const dishById = new Map(dishes.map((dish) => [dish._id, dish]));
  const entriesByDish = new Map();
  activeEntries.forEach((entry) => {
    if (!entriesByDish.has(entry.dish_id)) {
      entriesByDish.set(entry.dish_id, []);
    }
    entriesByDish.get(entry.dish_id).push(entry);
  });

  const original = { total_quantity: 0, total_amount: 0, by_user: {} };
  const final = { total_quantity: 0, total_amount: 0, by_user: {} };
  const items = [...entriesByDish.entries()].map(([dishId, dishEntries]) => {
    const dish = dishById.get(dishId) || { _id: dishId, name: '未知菜品', price: 0, image_file_id: '' };
    const price = Number(dish.price || 0);
    const originalByUser = {};
    const originalTotalQuantity = dishEntries.reduce((total, entry) => {
      const quantity = normalizeQuantity(entry.quantity);
      originalByUser[entry.user_id] = (originalByUser[entry.user_id] || 0) + quantity;
      addUserTotal(original.by_user, entry.user_id, quantity, price);
      return total + quantity;
    }, 0);

    original.total_quantity += originalTotalQuantity;
    original.total_amount += originalTotalQuantity * price;

    const confirmation = getConfirmationForDish(confirmations, dishId, originalTotalQuantity);
    const allocation = allocateEntries(dishEntries, confirmation.available_quantity);
    Object.entries(allocation.by_user).forEach(([userId, quantity]) => addUserTotal(final.by_user, userId, quantity, price));
    final.total_quantity += allocation.total_effective_quantity;
    final.total_amount += allocation.total_effective_quantity * price;

    return {
      dish: { _id: dish._id, name: dish.name, price, image_file_id: dish.image_file_id || '' },
      original_total_quantity: originalTotalQuantity,
      original_by_user: originalByUser,
      confirmation,
      allocation,
      final_total_quantity: allocation.total_effective_quantity,
      final_amount: allocation.total_effective_quantity * price,
    };
  });

  return { items, original, final };
}

module.exports = { allocateEntries, buildMenuSummary };
