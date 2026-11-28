// 축종별 기본 정보와 정상 체온 범위(직장 체온, ℃, 참고용 일반 범위)
// 범용 서비스를 위해 축종을 설정 데이터로 관리하고, 축종이 늘어나도 이 표만 수정합니다.
//
// anomaly: 이상 징후 판정 기준을 축종별로 덮어쓸 때 사용합니다. (없으면 기본값)
//   - feedDropRatio  : 최근 평균 대비 사료 섭취량 감소 비율 기준
//   - weightLossRatio: 직전 측정 대비 체중 감소 비율 기준
// 가금류는 개체 체중이 작아 측정 오차의 비중이 크므로 체중 감소 기준을 완화했습니다(참고값).
export const SPECIES = {
  cattle: { label: '한우·육우', icon: '🐂', normalTemp: { min: 38.0, max: 39.5 } },
  dairy: { label: '젖소', icon: '🐄', normalTemp: { min: 38.0, max: 39.5 } },
  pig: { label: '돼지', icon: '🐖', normalTemp: { min: 38.0, max: 40.0 } },
  poultry: {
    label: '닭·가금',
    icon: '🐓',
    normalTemp: { min: 40.5, max: 42.0 },
    anomaly: { weightLossRatio: 0.1 },
  },
  goat: { label: '염소·양', icon: '🐐', normalTemp: { min: 38.5, max: 40.0 } },
  other: { label: '기타', icon: '🐾', normalTemp: null },
};

export const SPECIES_OPTIONS = Object.entries(SPECIES).map(([value, info]) => ({
  value,
  label: info.label,
}));

export function getSpecies(key) {
  return SPECIES[key] ?? SPECIES.other;
}
