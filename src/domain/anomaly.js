import { getSpecies } from './species';

export const FEED_DROP_RATIO = 0.3; // 최근 평균 대비 30% 이상 감소
export const WEIGHT_LOSS_RATIO = 0.05; // 직전 측정 대비 5% 이상 감소
const FEED_BASELINE_COUNT = 3; // 최근 3회 기록의 평균을 기준으로 사용

/**
 * 하나의 건강 기록에서 이상 징후를 찾습니다.
 * @param {object} record 판정할 기록
 * @param {object[]} history 같은 개체의 다른 기록들 (순서 무관)
 * @param {string} speciesKey 축종 키
 * @returns {{ type: string, level: 'warn'|'danger', message: string }[]}
 */
export function detectAnomalies(record, history, speciesKey) {
  const alerts = [];
  const previous = history
    .filter((item) => item.date < record.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  // 1) 체온: 축종별 정상 범위 벗어남
  const range = getSpecies(speciesKey).normalTemp;
  if (range && record.temperature != null) {
    if (record.temperature > range.max) {
      alerts.push({ type: 'fever', level: 'danger', message: `발열 의심 (${record.temperature}℃, 정상 ${range.min}~${range.max}℃)` });
    } else if (record.temperature < range.min) {
      alerts.push({ type: 'hypothermia', level: 'warn', message: `저체온 의심 (${record.temperature}℃, 정상 ${range.min}~${range.max}℃)` });
    }
  }

  // 2) 사료 섭취량: 최근 평균 대비 급감
  if (record.feedKg != null) {
    const recentFeeds = previous
      .filter((item) => item.feedKg != null)
      .slice(0, FEED_BASELINE_COUNT)
      .map((item) => item.feedKg);
    if (recentFeeds.length > 0) {
      const average = recentFeeds.reduce((sum, value) => sum + value, 0) / recentFeeds.length;
      if (average > 0 && record.feedKg < average * (1 - FEED_DROP_RATIO)) {
        const percent = Math.round((1 - record.feedKg / average) * 100);
        alerts.push({ type: 'feedDrop', level: 'warn', message: `사료 섭취량 ${percent}% 감소 (최근 평균 ${average.toFixed(1)}kg)` });
      }
    }
  }

  // 3) 체중: 직전 측정 대비 감소
  if (record.weightKg != null) {
    const lastWeight = previous.find((item) => item.weightKg != null)?.weightKg;
    if (lastWeight && record.weightKg < lastWeight * (1 - WEIGHT_LOSS_RATIO)) {
      const percent = Math.round((1 - record.weightKg / lastWeight) * 100);
      alerts.push({ type: 'weightLoss', level: 'warn', message: `체중 ${percent}% 감소 (직전 ${lastWeight}kg)` });
    }
  }

  return alerts;
}

/** 경고 목록 중 가장 높은 수준을 반환합니다. 경고가 없으면 'ok'. */
export function highestLevel(alerts) {
  if (alerts.some((alert) => alert.level === 'danger')) return 'danger';
  if (alerts.length > 0) return 'warn';
  return 'ok';
}
