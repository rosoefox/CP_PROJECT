import { describe, it, expect } from 'vitest';
import {
  AnomalyDetector,
  createAnomalyDetector,
  detectAnomalies,
  FeedDropRule,
  highestLevel,
  TemperatureRule,
  WeightLossRule,
} from './anomaly';

const types = (alerts) => alerts.map((alert) => alert.type);

describe('detectAnomalies - 체온', () => {
  it('정상 범위면 경고 없음', () => {
    expect(detectAnomalies({ date: '2026-11-20', temperature: 38.7 }, [], 'cattle')).toEqual([]);
  });

  it('상한 초과는 발열(danger)', () => {
    const alerts = detectAnomalies({ date: '2026-11-20', temperature: 40.2 }, [], 'cattle');
    expect(types(alerts)).toEqual(['fever']);
    expect(alerts[0].level).toBe('danger');
  });

  it('하한 미만은 저체온(warn)', () => {
    expect(types(detectAnomalies({ date: '2026-11-20', temperature: 37.0 }, [], 'cattle'))).toEqual(['hypothermia']);
  });

  it('축종마다 기준이 다름: 닭 41℃는 정상, 소 41℃는 발열', () => {
    expect(detectAnomalies({ date: '2026-11-20', temperature: 41 }, [], 'poultry')).toEqual([]);
    expect(types(detectAnomalies({ date: '2026-11-20', temperature: 41 }, [], 'cattle'))).toEqual(['fever']);
  });

  it('기준이 없는 기타 축종은 체온 판정 안 함', () => {
    expect(detectAnomalies({ date: '2026-11-20', temperature: 50 }, [], 'other')).toEqual([]);
  });
});

describe('detectAnomalies - 사료 섭취량', () => {
  const history = [
    { date: '2026-11-17', feedKg: 10 },
    { date: '2026-11-18', feedKg: 10 },
    { date: '2026-11-19', feedKg: 10 },
  ];

  it('최근 평균 대비 30% 이상 감소하면 경고', () => {
    expect(types(detectAnomalies({ date: '2026-11-20', feedKg: 6 }, history, 'cattle'))).toEqual(['feedDrop']);
  });

  it('감소 폭이 30% 미만이면 경고 없음', () => {
    expect(detectAnomalies({ date: '2026-11-20', feedKg: 7.5 }, history, 'cattle')).toEqual([]);
  });

  it('이전 기록이 없으면 비교하지 않음', () => {
    expect(detectAnomalies({ date: '2026-11-20', feedKg: 1 }, [], 'cattle')).toEqual([]);
  });

  it('판정 날짜 이후의 기록은 기준에서 제외', () => {
    const future = [{ date: '2026-11-25', feedKg: 100 }];
    expect(detectAnomalies({ date: '2026-11-20', feedKg: 5 }, future, 'cattle')).toEqual([]);
  });
});

describe('detectAnomalies - 체중', () => {
  it('직전 측정 대비 5% 이상 감소하면 경고', () => {
    const history = [{ date: '2026-11-10', weightKg: 400 }];
    expect(types(detectAnomalies({ date: '2026-11-20', weightKg: 375 }, history, 'cattle'))).toEqual(['weightLoss']);
    expect(detectAnomalies({ date: '2026-11-20', weightKg: 390 }, history, 'cattle')).toEqual([]);
  });
});

describe('highestLevel', () => {
  it('danger > warn > ok', () => {
    expect(highestLevel([])).toBe('ok');
    expect(highestLevel([{ level: 'warn' }])).toBe('warn');
    expect(highestLevel([{ level: 'warn' }, { level: 'danger' }])).toBe('danger');
  });
});

describe('Factory 패턴 - 축종별 판정기 생성', () => {
  const ruleTypes = (detector) => detector.rules.map((rule) => rule.constructor);

  it('체온 기준이 있는 축종은 체온·사료·체중 규칙을 모두 조립', () => {
    const detector = createAnomalyDetector('cattle');
    expect(detector).toBeInstanceOf(AnomalyDetector);
    expect(ruleTypes(detector)).toEqual([TemperatureRule, FeedDropRule, WeightLossRule]);
  });

  it('체온 기준이 없는 기타 축종은 체온 규칙을 제외', () => {
    expect(ruleTypes(createAnomalyDetector('other'))).toEqual([FeedDropRule, WeightLossRule]);
  });

  it('축종 설정의 기준값을 규칙에 반영 (가금류 체중 감소 기준 10%)', () => {
    const weightRule = createAnomalyDetector('poultry').rules.find((rule) => rule instanceof WeightLossRule);
    expect(weightRule.ratio).toBe(0.1);
    const history = [{ date: '2026-11-10', weightKg: 2.0 }];
    // 7% 감소: 소 기준(5%)이면 경고, 가금류 기준(10%)이면 정상
    expect(detectAnomalies({ date: '2026-11-20', weightKg: 1.86 }, history, 'cattle')).toHaveLength(1);
    expect(detectAnomalies({ date: '2026-11-20', weightKg: 1.86 }, history, 'poultry')).toEqual([]);
  });

  it('같은 축종은 같은 판정기를 재사용', () => {
    expect(createAnomalyDetector('pig')).toBe(createAnomalyDetector('pig'));
  });
});
