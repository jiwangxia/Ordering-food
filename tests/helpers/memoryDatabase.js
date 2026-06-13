function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function matchesWhere(record, query) {
  return Object.entries(query).every(([key, value]) => record[key] === value);
}

function createMemoryDatabase() {
  const collections = {};
  let nextId = 1;

  function ensure(name) {
    if (!collections[name]) {
      collections[name] = [];
    }
    return collections[name];
  }

  return {
    async add(name, data) {
      const record = { _id: `${name}-${nextId++}`, ...clone(data) };
      ensure(name).push(record);
      return clone(record);
    },

    async findOne(name, query) {
      const record = ensure(name).find((item) => matchesWhere(item, query));
      return record ? clone(record) : null;
    },

    async findMany(name, query = {}) {
      return ensure(name).filter((item) => matchesWhere(item, query)).map(clone);
    },

    async update(name, id, patch) {
      const collection = ensure(name);
      const index = collection.findIndex((item) => item._id === id);
      if (index < 0) {
        return null;
      }
      collection[index] = { ...collection[index], ...clone(patch) };
      return clone(collection[index]);
    },

    async updateWhere(name, query, patch) {
      const records = ensure(name).filter((item) => matchesWhere(item, query));
      records.forEach((record) => Object.assign(record, clone(patch)));
      return records.map(clone);
    },

    dump() {
      return clone(collections);
    },
  };
}

module.exports = { createMemoryDatabase };
