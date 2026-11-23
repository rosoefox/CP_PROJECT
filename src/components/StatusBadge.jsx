import { getStatus } from '../domain/animalStatus';

function StatusBadge({ status }) {
  const info = getStatus(status);
  return <span className={`badge badge-${info.tone}`}>{info.label}</span>;
}

export default StatusBadge;
