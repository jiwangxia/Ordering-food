const cloud = require('wx-server-sdk');
const { createAppApi } = require('./core');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function createCloudDatabaseAdapter(db) {
  function collection(name) {
    return db.collection(name);
  }

  function unwrap(result) {
    return result && result.data ? result.data : null;
  }

  return {
    async add(name, data) {
      const result = await collection(name).add({ data });
      return { _id: result._id, ...data };
    },

    async findOne(name, query) {
      const result = await collection(name).where(query).limit(1).get();
      return result.data[0] || null;
    },

    async findMany(name, query = {}) {
      const result = await collection(name).where(query).get();
      return result.data || [];
    },

    async update(name, id, patch) {
      await collection(name).doc(id).update({ data: patch });
      const result = await collection(name).doc(id).get();
      return unwrap(result);
    },

    async updateWhere(name, query, patch) {
      const records = await this.findMany(name, query);
      for (const record of records) {
        await this.update(name, record._id, patch);
      }
      return this.findMany(name, query);
    },
  };
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const db = createCloudDatabaseAdapter(cloud.database());
  const api = createAppApi({ db });
  const action = event.action;

  if (!api[action]) {
    return { ok: false, code: 'UNKNOWN_ACTION', message: `未知操作：${action || ''}` };
  }

  try {
    const data = await api[action]({
      openid: wxContext.OPENID,
      data: event.data || {},
    });
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || '服务异常',
    };
  }
};
