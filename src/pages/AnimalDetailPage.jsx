import { useParams } from 'react-router-dom';

function AnimalDetailPage() {
  const { animalId } = useParams();
  return (
    <section>
      <h2>개체 상세</h2>
      <p className="muted">개체 {animalId}의 건강 기록이 표시될 영역입니다.</p>
    </section>
  );
}

export default AnimalDetailPage;
