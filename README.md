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
