import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import HealthRecordForm from '../components/HealthRecordForm';
import StatusBadge from '../components/StatusBadge';
import { animalRepository } from '../repositories/animalRepository';
import { recordRepository } from '../repositories/recordRepository';
import { canTransition, getStatus, isEditable } from '../domain/animalStatus';
import { getSpecies } from '../domain/species';
import { detectAnomalies } from '../domain/anomaly';

function AnimalDetailPage() {
  const { animalId } = useParams();
  const [animal, setAnimal] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    Promise.all([animalRepository.get(animalId), recordRepository.listByAnimal(animalId)])
      .then(([foundAnimal, foundRecords]) => {
        setAnimal(foundAnimal);
        setRecords(foundRecords);
      })
      .catch(() => setError('개체 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [animalId]);

  if (loading) return <p className="muted">불러오는 중…</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!animal) {
    return (
      <div className="empty">
        <p>존재하지 않는 개체입니다.</p>
        <Link to="/animals">개체 목록으로</Link>
      </div>
    );
  }

  const species = getSpecies(animal.species);
  const editable = isEditable(animal.status);
  const nextStatuses = getStatus(animal.status).next;

  const handleStatusChange = async (event) => {
    const next = event.target.value;
    if (!next) return;
    if (!canTransition(animal.status, next)) {
      setStatusError('변경할 수 없는 상태입니다.');
      return;
    }
    const label = getStatus(next).label;
    if (getStatus(next).terminal && !window.confirm(`'${label}' 처리 후에는 상태 변경과 기록 추가가 불가능합니다. 계속할까요?`)) {
      return;
    }
    try {
      setStatusError('');
      setAnimal(await animalRepository.update(animal.id, { status: next }));
    } catch (e) {
      setStatusError(e.message);
    }
  };

  const handleCreateRecord = async (data) => {
    const created = await recordRepository.create(animal.id, data);
    setRecords((prev) => [created, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
  };

  return (
    <section>
      <Link to="/animals" className="back-link">← 개체 목록</Link>

      <div className="card detail-header">
        <span className="detail-icon">{species.icon}</span>
        <div className="animal-main">
          <h2>
            {animal.tagNumber} {animal.name && <span className="muted">· {animal.name}</span>}
          </h2>
          <p className="muted">
            {species.label} · {animal.sex === 'F' ? '암' : '수'} · {animal.birthDate}생
            {species.normalTemp && ` · 정상 체온 ${species.normalTemp.min}~${species.normalTemp.max}℃`}
          </p>
        </div>
        <div className="detail-status">
          <StatusBadge status={animal.status} />
          {nextStatuses.length > 0 && (
            <select value="" onChange={handleStatusChange} aria-label="상태 변경">
              <option value="">상태 변경</option>
              {nextStatuses.map((status) => (
                <option key={status} value={status}>
                  {getStatus(status).label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {statusError && <p className="alert alert-danger">{statusError}</p>}

      {editable ? (
        <HealthRecordForm
          animal={animal}
          existingDates={records.map((record) => record.date)}
          onSubmit={handleCreateRecord}
        />
      ) : (
        <p className="card muted">{getStatus(animal.status).label} 처리된 개체는 새 기록을 추가할 수 없습니다.</p>
      )}

      <h3>건강 기록</h3>
      {records.length === 0 ? (
        <div className="empty">아직 기록이 없습니다.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>체온</th>
                <th>사료</th>
                <th>체중</th>
                <th>판정</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const alerts = detectAnomalies(record, records, animal.species);
                return (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.temperature != null ? `${record.temperature}℃` : '-'}</td>
                    <td>{record.feedKg != null ? `${record.feedKg}kg` : '-'}</td>
                    <td>{record.weightKg != null ? `${record.weightKg}kg` : '-'}</td>
                    <td>
                      {alerts.length === 0 ? (
                        <span className="badge badge-ok">정상</span>
                      ) : (
                        alerts.map((alert) => (
                          <span key={alert.type} className={`badge badge-${alert.level}`} title={alert.message}>
                            {alert.message}
                          </span>
                        ))
                      )}
                    </td>
                    <td className="muted">{record.note || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AnimalDetailPage;
