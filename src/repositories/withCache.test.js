import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withCache } from './withCache';

describe('Decorator 패턴 - withCache', () => {
  let base;
  let time;
  let user;
  let repo;

  beforeEach(() => {
    base = {
      list: vi.fn(async () => ['a']),
      get: vi.fn(async (id) => ({ id })),
      create: vi.fn(async (data) => data),
    };
    time = 0;
    user = 'u1';
    repo = withCache(base, { readMethods: ['list', 'get'], ttlMs: 1000, scope: () => user, now: () => time });
  });

  it('원래 저장소와 같은 메서드·결과를 제공', async () => {
    await expect(repo.list()).resolves.toEqual(['a']);
    await expect(repo.get('x')).resolves.toEqual({ id: 'x' });
    await expect(repo.create({ n: 1 })).resolves.toEqual({ n: 1 });
  });

  it('유효 시간 안의 같은 조회는 캐시 사용, 인자가 다르면 따로 조회', async () => {
    await repo.get('x');
    await repo.get('x');
    await repo.get('y');
    expect(base.get).toHaveBeenCalledTimes(2);
  });

  it('응답 전에 동시에 들어온 같은 조회는 한 번만 실행', async () => {
    await Promise.all([repo.list(), repo.list(), repo.list()]);
    expect(base.list).toHaveBeenCalledTimes(1);
  });

  it('유효 시간이 지나면 다시 조회', async () => {
    await repo.list();
    time = 1500;
    await repo.list();
    expect(base.list).toHaveBeenCalledTimes(2);
  });

  it('쓰기 작업 후에는 캐시를 비움', async () => {
    await repo.list();
    await repo.create({});
    await repo.list();
    expect(base.list).toHaveBeenCalledTimes(2);
  });

  it('사용자(scope)가 바뀌면 캐시를 공유하지 않음', async () => {
    await repo.list();
    user = 'u2';
    await repo.list();
    expect(base.list).toHaveBeenCalledTimes(2);
  });

  it('실패한 조회는 캐시하지 않음', async () => {
    base.list.mockRejectedValueOnce(new Error('network'));
    await expect(repo.list()).rejects.toThrow('network');
    await expect(repo.list()).resolves.toEqual(['a']);
    expect(base.list).toHaveBeenCalledTimes(2);
  });
});
