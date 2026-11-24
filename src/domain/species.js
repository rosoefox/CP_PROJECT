// 축종별 기본 정보와 정상 체온 범위(직장 체온, ℃, 참고용 일반 범위)
// 범용 서비스를 위해 축종을 설정 데이터로 관리하고, 축종이 늘어나도 이 표만 수정합니다.
export const SPECIES = {
  cattle: { label: '한우·육우', icon: '🐂', normalTemp: { min: 38.0, max: 39.5 } },
  dairy: { label: '젖소', icon: '🐄', normalTemp: { min: 38.0, max: 39.5 } },
  pig: { label: '돼지', icon: '🐖', normalTemp: { min: 38.0, max: 40.0 } },
  poultry: { label: '닭·가금', icon: '🐓', normalTemp: { min: 40.5, max: 42.0 } },
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
