// 라벨 + 입력 요소 + 오류 메시지를 묶는 공통 폼 필드
function Field({ label, error, children }) {
  return (
    <label className={error ? 'field has-error' : 'field'}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export default Field;
