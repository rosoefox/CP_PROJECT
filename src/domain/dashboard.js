import { isEditable } from './animalStatus';
import { detectAnomalies, highestLevel } from './anomaly';

/**
 * 대시보드에 표시할 농장 현황을 계산합니다.
 * - 사육 두수: 출하·폐사를 제외한 개체 수
 * - 이상 개체: 각 개체의 최신 기록에서 이상 징후가 나온 개체 (위험 수준 우선 정렬)
 * - 오늘 미기록: 사육 중인 개체 중 오늘 기록이 없는 개체
 */
export function buildDashboard(animals, records, today) {
  const recordsByAnimal = new Map();
  for (const record of records) {
    const list = recordsByAnimal.get(record.animalId) ?? [];
    list.push(record);
    recordsByAnimal.set(record.animalId, list);
  }

  const managed = animals.filter((animal) => isEditable(animal.status));

  const speciesCount = {};
  for (const animal of managed) {
    speciesCount[animal.species] = (speciesCount[animal.species] ?? 0) + 1;
  }

  const alerts = [];
  const notRecordedToday = [];
  for (const animal of managed) {
    const history = recordsByAnimal.get(animal.id) ?? [];
    const latest = [...history].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latest || latest.date !== today) notRecordedToday.push(animal);
    if (!latest) continue;

    const found = detectAnomalies(latest, history, animal.species);
    if (found.length > 0) {
      alerts.push({ animal, record: latest, alerts: found, level: highestLevel(found) });
    }
  }
  alerts.sort((a, b) => (a.level === b.level ? b.record.date.localeCompare(a.record.date) : a.level === 'danger' ? -1 : 1));

  return {
    totalCount: managed.length,
    treatmentCount: managed.filter((animal) => animal.status === 'treatment').length,
    speciesCount,
    alerts,
    notRecordedToday,
  };
}
