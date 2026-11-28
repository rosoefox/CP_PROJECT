// 실제 앱에서 쓰는 서비스 인스턴스: Firestore 저장소와 공용 이벤트 버스를 연결합니다.
import { animalRepository } from '../repositories/animalRepository';
import { recordRepository } from '../repositories/recordRepository';
import { domainEvents } from '../lib/eventBus';
import { createLivestockService } from './livestockService';

export const livestockService = createLivestockService({
  animalRepository,
  recordRepository,
  events: domainEvents,
});
