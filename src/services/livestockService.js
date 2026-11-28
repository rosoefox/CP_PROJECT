import { getAnimalState } from '../domain/animalState';
import { createAnomalyDetector, highestLevel } from '../domain/anomaly';
import { EVENTS } from '../lib/eventBus';

/**
 * 개체·건강 기록 업무 처리(서비스 계층)
 *
 * 화면은 "기록 저장", "상태 변경" 같은 업무 단위로만 요청하고,
 * 상태 규칙 확인 → 저장 → 이상 징후 판정 → 이벤트 발행 순서는 이 서비스가 맡습니다.
 * 저장소와 이벤트 버스를 주입받아, 테스트에서는 가짜 객체로 바꿔 검증할 수 있습니다.
 *
 * @param {{ animalRepository, recordRepository, events }} deps
 */
export function createLivestockService({ animalRepository, recordRepository, events }) {
  return {
    async registerAnimal(data) {
      const animal = await animalRepository.create(data);
      events.publish(EVENTS.ANIMAL_CREATED, { animal });
      return animal;
    },

    /** 상태 패턴으로 전이 가능 여부를 확인한 뒤 저장하고, 변경 사실을 알립니다. */
    async changeStatus(animal, nextKey) {
      const from = getAnimalState(animal.status);
      const to = from.changeTo(nextKey); // 허용되지 않은 전이면 오류
      const updated = await animalRepository.update(animal.id, { status: to.key });
      events.publish(EVENTS.ANIMAL_STATUS_CHANGED, { animal: updated, from: from.key, to: to.key });
      return updated;
    },

    /**
     * 건강 기록을 저장하고 이상 징후를 판정합니다.
     * @param {object} animal 대상 개체
     * @param {object} data 기록 입력값
     * @param {object[]} history 기존 기록 (판정 기준)
     * @returns {{ record, alerts }}
     */
    async addHealthRecord(animal, data, history) {
      const state = getAnimalState(animal.status);
      if (!state.canAddRecord()) {
        throw new Error(`${state.label} 처리된 개체는 새 기록을 추가할 수 없습니다.`);
      }

      const record = await recordRepository.create(animal.id, data);
      events.publish(EVENTS.RECORD_CREATED, { animal, record });

      const alerts = createAnomalyDetector(animal.species).detect(record, history);
      if (alerts.length > 0) {
        events.publish(EVENTS.ANOMALY_DETECTED, { animal, record, alerts, level: highestLevel(alerts) });
      }
      return { record, alerts };
    },
  };
}
