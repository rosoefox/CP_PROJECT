# CP_PROJECT

초급프로젝트 Term Project — React + Firebase 웹서비스 (JCloud 배포)

## 기술 스택
- React + Vite
- Firebase Authentication / Cloud Firestore
- Vitest (테스트)
- GitHub Actions (빌드·테스트 CI)

## 요구 사항
- Node.js 20 이상

## 설치 및 실행
```bash
npm install      # 의존성 설치
npm run dev      # 로컬 개발 서버 실행
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

## Firebase 설정
1. Firebase 콘솔에서 프로젝트와 웹 앱을 만듭니다.
2. `.env.example`을 복사해 `.env` 파일을 만들고 설정값을 채웁니다.
   ```bash
   cp .env.example .env
   ```
3. `.env`는 `.gitignore`에 포함되어 저장소에 올라가지 않습니다.

## 테스트
```bash
npm test             # 전체 테스트 1회 실행
npm run test:watch   # 변경 감지 모드
```

## CI
`main` 브랜치 push 및 PR마다 GitHub Actions가 `npm ci → npm test → npm run build`를 실행합니다. (`.github/workflows/ci.yml`)

## Firestore Security Rules
접근 규칙은 [`firestore.rules`](firestore.rules)에서 관리합니다.

### 데이터 구조
| 컬렉션 | 주요 필드 | 문서 ID |
|---|---|---|
| `users` | uid, email, displayName, createdAt | 사용자 UID |
| `animals` | ownerId, tagNumber, name, species, sex, birthDate, status, createdAt, updatedAt | 자동 생성 |
| `healthRecords` | ownerId, animalId, date, temperature, feedKg, weightKg, note, createdAt | `{animalId}_{date}` |

### 접근 권한
| 데이터 | 조회 | 등록 | 수정 | 삭제 |
|---|---|---|---|---|
| `users/{uid}` | 본인 | 본인 | 본인 | 본인 |
| `animals` | 본인 소유 | 본인 소유 + `active` 상태로만 | 본인 소유, 소유자·개체번호 변경 불가, 출하·폐사 후 불가, 허용된 상태 전이만 | 불가 (이력 보존) |
| `healthRecords` | 본인 소유 | 본인 개체 + 출하·폐사 아님 + 같은 날짜 중복 불가 | 불가 | 불가 |
| 그 외 경로 | 불가 | 불가 | 불가 | 불가 |

### 규칙 적용
- **콘솔:** Firebase 콘솔 → Firestore Database → 규칙 탭에 `firestore.rules` 내용을 붙여넣고 게시
- **CLI:** (프로젝트 ID는 `.firebaserc`에 지정)
  ```bash
  npx firebase-tools login
  npx firebase-tools deploy --only firestore:rules
  ```
