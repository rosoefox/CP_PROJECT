import { describe, it, expect } from 'vitest';
import { DEFAULT_DATA_ERROR, runDataTask, toDataErrorMessage, userError } from './dataErrors';

describe('toDataErrorMessage', () => {
  it('권한 거부는 권한 안내 메시지', () => {
    expect(toDataErrorMessage({ code: 'permission-denied' })).toContain('접근 권한이 없습니다');
  });

  it('알 수 없는 오류는 기본 메시지', () => {
    expect(toDataErrorMessage({ code: 'weird' })).toBe(DEFAULT_DATA_ERROR);
    expect(toDataErrorMessage(undefined)).toBe(DEFAULT_DATA_ERROR);
  });
});

describe('runDataTask', () => {
  it('성공하면 결과를 그대로 반환', async () => {
    await expect(runDataTask(async () => 42)).resolves.toBe(42);
  });

  it('Firestore 오류는 안내 메시지로 바꾸고 코드는 유지', async () => {
    const failing = async () => {
      throw Object.assign(new Error('raw'), { code: 'permission-denied' });
    };
    await expect(runDataTask(failing)).rejects.toMatchObject({ code: 'permission-denied' });
    await expect(runDataTask(failing)).rejects.toThrow('접근 권한이 없습니다');
  });

  it('userError는 메시지를 바꾸지 않음', async () => {
    await expect(runDataTask(async () => { throw userError('중복입니다.'); })).rejects.toThrow('중복입니다.');
  });
});
