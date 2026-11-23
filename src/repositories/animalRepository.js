import { newId, readCollection, writeCollection } from './localStore';

const COLLECTION = 'animals';

// 개체 데이터 접근을 담당합니다. 화면은 저장 방식(localStorage/Firestore)을 알지 못합니다.
export const animalRepository = {
  async list() {
    return readCollection(COLLECTION).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async get(id) {
    return readCollection(COLLECTION).find((animal) => animal.id === id) ?? null;
  },

  async create(data) {
    const items = readCollection(COLLECTION);
    const now = new Date().toISOString();
    const animal = { ...data, id: newId(), status: 'active', createdAt: now, updatedAt: now };
    writeCollection(COLLECTION, [...items, animal]);
    return animal;
  },

  async update(id, changes) {
    const items = readCollection(COLLECTION);
    const index = items.findIndex((animal) => animal.id === id);
    if (index === -1) throw new Error('개체를 찾을 수 없습니다.');
    const updated = { ...items[index], ...changes, updatedAt: new Date().toISOString() };
    items[index] = updated;
    writeCollection(COLLECTION, items);
    return updated;
  },
};
