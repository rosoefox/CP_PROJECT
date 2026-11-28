import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimalForm from '../components/AnimalForm';
import StatusBadge from '../components/StatusBadge';
import { animalRepository } from '../repositories/animalRepository';
import { livestockService } from '../services';
import { ANIMAL_STATES } from '../domain/animalState';
import { getSpecies, SPECIES_OPTIONS } from '../domain/species';
import { DEFAULT_SORT, getSortStrategy, SORT_STRATEGIES, sortAnimals } from '../domain/sortStrategies';

function AnimalListPage() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState(DEFAULT_SORT.key);

  useEffect(() => {
    animalRepository
      .list()
      .then(setAnimals)
      .catch((e) => setError(`개체 목록을 불러오지 못했습니다. ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      sortAnimals(
        animals.filter(
          (animal) =>
            (!speciesFilter || animal.species === speciesFilter) &&
            (!statusFilter || animal.status === statusFilter),
        ),
        getSortStrategy(sortKey),
      ),
    [animals, speciesFilter, statusFilter, sortKey],
  );

  const handleCreate = async (data) => {
    const created = await livestockService.registerAnimal(data);
    setAnimals((prev) => [created, ...prev]);
    setShowForm(false);
  };

  return (
    <section>
      <div className="page-header">
        <h2>개체 관리</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + 개체 등록
          </button>
        )}
      </div>

      {showForm && (
        <AnimalForm
          existingTags={animals.map((animal) => animal.tagNumber)}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="toolbar">
        <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}>
          <option value="">전체 축종</option>
          {SPECIES_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">전체 상태</option>
          {ANIMAL_STATES.map((state) => (
            <option key={state.key} value={state.key}>
              {state.label}
            </option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="정렬">
          {SORT_STRATEGIES.map((strategy) => (
            <option key={strategy.key} value={strategy.key}>
              {strategy.label}
            </option>
          ))}
        </select>
        <span className="muted">{filtered.length}두</span>
      </div>

      {loading && <p className="muted">불러오는 중…</p>}
      {error && <p className="alert alert-danger">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty">
          {animals.length === 0 ? '등록된 개체가 없습니다. 첫 개체를 등록해보세요.' : '조건에 맞는 개체가 없습니다.'}
        </div>
      )}

      {filtered.length > 0 && (
        <ul className="animal-list">
          {filtered.map((animal) => {
            const species = getSpecies(animal.species);
            return (
              <li key={animal.id}>
                <Link to={`/animals/${animal.id}`} className="animal-row">
                  <span className="animal-icon">{species.icon}</span>
                  <span className="animal-main">
                    <strong>{animal.tagNumber}</strong>
                    {animal.name && <span className="muted"> · {animal.name}</span>}
                    <span className="animal-sub muted">
                      {species.label} · {animal.sex === 'F' ? '암' : '수'} · {animal.birthDate}생
                    </span>
                  </span>
                  <StatusBadge status={animal.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default AnimalListPage;
