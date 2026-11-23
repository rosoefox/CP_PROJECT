import { useState } from 'react';
import { SPECIES_OPTIONS } from '../domain/species';
import { todayString, validateAnimal } from '../domain/animalValidation';
import Field from './Field';

const EMPTY = { tagNumber: '', name: '', species: '', sex: '', birthDate: '' };

function AnimalForm({ existingTags, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAnimal(values, { existingTags });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit({ ...values, tagNumber: values.tagNumber.trim(), name: values.name.trim() });
      setValues(EMPTY);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h3>새 개체 등록</h3>
      <div className="form-grid">
        <Field label="개체번호 *" error={errors.tagNumber}>
          <input name="tagNumber" value={values.tagNumber} onChange={handleChange} placeholder="예: KR-0001" />
        </Field>
        <Field label="이름" error={errors.name}>
          <input name="name" value={values.name} onChange={handleChange} placeholder="선택 입력" />
        </Field>
        <Field label="축종 *" error={errors.species}>
          <select name="species" value={values.species} onChange={handleChange}>
            <option value="">선택</option>
            {SPECIES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="성별 *" error={errors.sex}>
          <select name="sex" value={values.sex} onChange={handleChange}>
            <option value="">선택</option>
            <option value="F">암</option>
            <option value="M">수</option>
          </select>
        </Field>
        <Field label="출생일 *" error={errors.birthDate}>
          <input type="date" name="birthDate" value={values.birthDate} max={todayString()} onChange={handleChange} />
        </Field>
      </div>
      {submitError && <p className="alert alert-danger">{submitError}</p>}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? '저장 중…' : '등록'}
        </button>
      </div>
    </form>
  );
}

export default AnimalForm;
