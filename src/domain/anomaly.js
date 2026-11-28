import { getSpecies } from './species';

// 이상 징후 판정
//
// [Factory 패턴] createAnomalyDetector(speciesKey)
//   축종마다 적용할 판정 규칙의 종류와 기준값이 다릅니다.
//   (예: '기타' 축종은 체온 기준이 없어 체온 규칙 제외, 가금류는 체중 감소 기준 완화)
//   어떤 규칙 객체를 어떤 기준값으로 조립할지는 팩토리만 알고,
//   호출하는 쪽(화면·대시보드)은 축종 키만 넘겨 완성된 판정기(AnomalyDetector)를 받습니다.
//   - Product         : AnomalyDetector (규칙 목록을 받아 detect 수행)
//   - 구성 요소(Rule)  : TemperatureRule / FeedDropRule / WeightLossRule — evaluate(record, previous)
//   - Factory         : createAnomalyDetector — 축종 설정을 읽어 규칙을 생성·조립, 축종별로 재사용

export const DEFAULT_FEED_DROP_RATIO = 0.3; // 최근 평균 대비 30% 이상 감소
export const DEFAULT_WEIGHT_LOSS_RATIO = 0.05; // 직전 측정 대비 5% 이상 감소
const FEED_BASELINE_COUNT = 3; // 최근 3회 기록의 평균을 기준으로 사용

// ── 규칙 ─────────────────────────────────────────

/** 체온이 정상 범위를 벗어나면 경고 */
export class TemperatureRule {
  constructor(range) {
    this.range = range;
  }

  evaluate(record) {
    const { min, max } = this.range;
    const temp = record.temperature;
    if (temp == null) return null;
    if (temp > max) return { type: 'fever', level: 'danger', message: `발열 의심 (${temp}℃, 정상 ${min}~${max}℃)` };
    if (temp < min) return { type: 'hypothermia', level: 'warn', message: `저체온 의심 (${temp}℃, 정상 ${min}~${max}℃)` };
    return null;
  }
}

/** 사료 섭취량이 최근 평균 대비 기준 비율 이상 줄면 경고 */
export class FeedDropRule {
  constructor(ratio = DEFAULT_FEED_DROP_RATIO, baselineCount = FEED_BASELINE_COUNT) {
    this.ratio = ratio;
    this.baselineCount = baselineCount;
  }

  evaluate(record, previous) {
    if (record.feedKg == null) return null;
    const recent = previous.filter((item) => item.feedKg != null).slice(0, this.baselineCount);
    if (recent.length === 0) return null;
    const average = recent.reduce((sum, item) => sum + item.feedKg, 0) / recent.length;
    if (average <= 0 || record.feedKg >= average * (1 - this.ratio)) return null;
    const percent = Math.round((1 - record.feedKg / average) * 100);
    return { type: 'feedDrop', level: 'warn', message: `사료 섭취량 ${percent}% 감소 (최근 평균 ${average.toFixed(1)}kg)` };
  }
}

/** 체중이 직전 측정 대비 기준 비율 이상 줄면 경고 */
export class WeightLossRule {
  constructor(ratio = DEFAULT_WEIGHT_LOSS_RATIO) {
    this.ratio = ratio;
  }

  evaluate(record, previous) {
    if (record.weightKg == null) return null;
    const lastWeight = previous.find((item) => item.weightKg != null)?.weightKg;
    if (!lastWeight || record.weightKg >= lastWeight * (1 - this.ratio)) return null;
    const percent = Math.round((1 - record.weightKg / lastWeight) * 100);
    return { type: 'weightLoss', level: 'warn', message: `체중 ${percent}% 감소 (직전 ${lastWeight}kg)` };
  }
}

// ── 판정기 (Product) ──────────────────────────────

export class AnomalyDetector {
  constructor(rules) {
    this.rules = rules;
  }

  /**
   * @param {object} record 판정할 기록
   * @param {object[]} history 같은 개체의 기록들 (순서 무관, 판정 날짜 이후 기록은 무시)
   * @returns {{ type: string, level: 'warn'|'danger', message: string }[]}
   */
  detect(record, history) {
    const previous = history
      .filter((item) => item.date < record.date)
      .sort((a, b) => b.date.localeCompare(a.date));
    return this.rules.map((rule) => rule.evaluate(record, previous)).filter(Boolean);
  }
}

// ── 팩토리 ───────────────────────────────────────

const detectorCache = new Map();

/** 축종에 맞는 판정기를 만듭니다. 같은 축종은 만든 판정기를 재사용합니다. */
export function createAnomalyDetector(speciesKey) {
  if (detectorCache.has(speciesKey)) return detectorCache.get(speciesKey);

  const species = getSpecies(speciesKey);
  const options = species.anomaly ?? {};
  const rules = [];
  if (species.normalTemp) rules.push(new TemperatureRule(species.normalTemp));
  rules.push(new FeedDropRule(options.feedDropRatio ?? DEFAULT_FEED_DROP_RATIO));
  rules.push(new WeightLossRule(options.weightLossRatio ?? DEFAULT_WEIGHT_LOSS_RATIO));

  const detector = new AnomalyDetector(rules);
  detectorCache.set(speciesKey, detector);
  return detector;
}

/** 편의 함수: 축종에 맞는 판정기로 기록 하나를 판정합니다. */
export function detectAnomalies(record, history, speciesKey) {
  return createAnomalyDetector(speciesKey).detect(record, history);
}

/** 경고 목록 중 가장 높은 수준을 반환합니다. 경고가 없으면 'ok'. */
export function highestLevel(alerts) {
  if (alerts.some((alert) => alert.level === 'danger')) return 'danger';
  if (alerts.length > 0) return 'warn';
  return 'ok';
}
