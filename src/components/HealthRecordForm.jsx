import { useState } from 'react';
import Field from './Field';
import { todayString } from '../domain/animalValidation';
import { toNumberOrNull, validateHealthRecord } from '../domain/healthRecord';

const emptyValues = () => ({ date: todayString(), temperature: '', feedKg: '', weightKg: '', note: '' });

function HealthRecordForm({ animal, existingDates, onSubmit }) {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = {
      date: values.date,
      temperature: toNumberOrNull(values.temperature),
      feedKg: toNumberOrNull(values.feedKg),
      weightKg: toNumberOrNull(values.weightKg),
      note: values.note.trim(),
    };
    const nextErrors = validateHealthRecord(data, { existingDates, birthDate: animal.birthDate });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit(data);
      setValues(emptyValues());
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h3>건강 기록 추가</h3>
      <div className="form-grid">
        <Field label="날짜 *" error={errors.date}>
          <input type="date" name="date" value={values.date} max={todayString()} onChange={handleChange} />
        </Field>
        <Field label="체온 (℃)" error={errors.temperature}>
          <input type="number" step="0.1" name="temperature" value={values.temperature} onChange={handleChange} />
        </Field>
        <Field label="사료 섭취량 (kg)" error={errors.feedKg}>
          <input type="number" step="0.1" name="feedKg" value={values.feedKg} onChange={handleChange} />
        </Field>
        <Field label="체중 (kg)" error={errors.weightKg}>
          <input type="number" step="0.1" name="weightKg" value={values.weightKg} onChange={handleChange} />
        </Field>
      </div>
      <div className="form-grid form-grid-full">
        <Field label="메모" error={errors.note}>
          <textarea name="note" rows="2" value={values.note} onChange={handleChange} placeholder="특이사항 (선택)" />
        </Field>
      </div>
      {errors.form && <p className="alert alert-danger">{errors.form}</p>}
      {submitError && <p className="alert alert-danger">{submitError}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? '저장 중…' : '기록 저장'}
        </button>
      </div>
    </form>
  );
}

export default HealthRecordForm;
