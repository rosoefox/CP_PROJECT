import { getAnimalState } from '../domain/animalState';

function StatusBadge({ status }) {
  const state = getAnimalState(status);
  return <span className={`badge badge-${state.tone}`}>{state.label}</span>;
}

export default StatusBadge;
