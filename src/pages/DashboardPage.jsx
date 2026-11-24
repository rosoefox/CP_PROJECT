import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animalRepository } from '../repositories/animalRepository';
import { recordRepository } from '../repositories/recordRepository';
import { buildDashboard } from '../domain/dashboard';
import { todayString } from '../domain/animalValidation';
import { getSpecies } from '../domain/species';

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([animalRepository.list(), recordRepository.listAll()])
      .then(([animals, records]) => setSummary(buildDashboard(animals, records, todayString())))
      .catch((e) => setError(`현황을 불러오지 못했습니다. ${e.message}`));
  }, []);

  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!summary) return <p className="muted">불러오는 중…</p>;

  if (summary.totalCount === 0) {
    return (
      <section>
        <h2>대시보드</h2>
        <div className="empty">
          <p>관리 중인 개체가 없습니다.</p>
          <Link to="/animals" className="btn btn-primary">개체 등록하러 가기</Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>대시보드</h2>

      <div className="stats">
        <Stat label="사육 두수" value={summary.totalCount} unit="두" />
        <Stat label="치료 중" value={summary.treatmentCount} unit="두" tone={summary.treatmentCount ? 'warn' : ''} />
        <Stat label="이상 징후" value={summary.alerts.length} unit="두" tone={summary.alerts.length ? 'danger' : ''} />
        <Stat label="오늘 미기록" value={summary.notRecordedToday.length} unit="두" />
      </div>

      <div className="card">
        <h3>축종별 사육 현황</h3>
        <div className="species-chips">
          {Object.entries(summary.speciesCount).map(([key, count]) => {
            const species = getSpecies(key);
            return (
              <span key={key} className="chip">
                {species.icon} {species.label} <strong>{count}</strong>
              </span>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>이상 징후 개체</h3>
        {summary.alerts.length === 0 ? (
          <p className="muted">최근 기록에서 이상 징후가 발견되지 않았습니다.</p>
        ) : (
          <ul className="alert-list">
            {summary.alerts.map(({ animal, record, alerts, level }) => (
              <li key={animal.id} className={`alert-item alert-item-${level}`}>
                <Link to={`/animals/${animal.id}`}>
                  {getSpecies(animal.species).icon} <strong>{animal.tagNumber}</strong>
                  {animal.name && ` · ${animal.name}`}
                </Link>
                <span className="muted"> ({record.date})</span>
                <ul>
                  {alerts.map((alert) => (
                    <li key={alert.type}>{alert.message}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {summary.notRecordedToday.length > 0 && (
        <div className="card">
          <h3>오늘 기록이 필요한 개체</h3>
          <div className="species-chips">
            {summary.notRecordedToday.map((animal) => (
              <Link key={animal.id} to={`/animals/${animal.id}`} className="chip">
                {getSpecies(animal.species).icon} {animal.tagNumber}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, unit, tone = '' }) {
  return (
    <div className={`stat ${tone ? `stat-${tone}` : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {value}
        <small>{unit}</small>
      </span>
    </div>
  );
}

export default DashboardPage;
