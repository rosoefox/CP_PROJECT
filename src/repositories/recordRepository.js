import { newId, readCollection, writeCollection } from './localStore';

const COLLECTION = 'healthRecords';

const byDateDesc = (a, b) => b.date.localeCompare(a.date);

// 일일 건강 기록 데이터 접근을 담당합니다.
export const recordRepository = {
  async listAll() {
    return readCollection(COLLECTION).sort(byDateDesc);
  },

  async listByAnimal(animalId) {
    return readCollection(COLLECTION)
      .filter((record) => record.animalId === animalId)
      .sort(byDateDesc);
  },

  async create(animalId, data) {
    const items = readCollection(COLLECTION);
    if (items.some((record) => record.animalId === animalId && record.date === data.date)) {
      throw new Error('해당 날짜의 기록이 이미 있습니다.');
    }
    const record = { ...data, id: newId(), animalId, createdAt: new Date().toISOString() };
    writeCollection(COLLECTION, [...items, record]);
    return record;
  },
};
