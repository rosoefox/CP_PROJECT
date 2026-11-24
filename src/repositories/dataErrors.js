// Firestore 에러 코드를 사용자 안내 메시지로 변환합니다.
const MESSAGES = {
  'permission-denied': '접근 권한이 없습니다. 본인 데이터만 조회·수정할 수 있습니다.',
  unauthenticated: '로그인이 필요합니다.',
  unavailable: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
  'deadline-exceeded': '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
  'resource-exhausted': '사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
};

export const DEFAULT_DATA_ERROR = '데이터 처리 중 오류가 발생했습니다.';

export function toDataErrorMessage(error) {
  return MESSAGES[error?.code] ?? DEFAULT_DATA_ERROR;
}

/** 저장소 작업을 실행하고, 실패하면 사용자 안내 메시지를 담은 Error로 바꿔 던집니다. */
export async function runDataTask(task) {
  try {
    return await task();
  } catch (error) {
    if (error?.userMessage) throw error; // 이미 안내 메시지가 정해진 오류
    const wrapped = new Error(toDataErrorMessage(error));
    wrapped.code = error?.code;
    throw wrapped;
  }
}

/** 업무 규칙 위반처럼 화면에 그대로 보여줄 오류를 만듭니다. */
export function userError(message) {
  const error = new Error(message);
  error.userMessage = true;
  return error;
}
