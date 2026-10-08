// Integration tests. Need a real MongoDB: TEST_MONGODB_URI=mongodb://127.0.0.1:27017/life-rpg-test npm test
import test from 'node:test';
import assert from 'node:assert/strict';

if (!process.env.TEST_MONGODB_URI) {
  test('API integration tests', { skip: 'set TEST_MONGODB_URI to run' }, () => {});
} else {
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI;
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  const { default: mongoose } = await import('mongoose');
  const { default: app } = await import('../src/app.js');
  const { User } = await import('../src/models/User.js');
  await mongoose.connect(process.env.MONGODB_URI);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const call = async (method, path, { body, token, cookie } = {}) => {
    const res = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }), ...(cookie && { cookie }) }, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    return { status: res.status, json: text ? JSON.parse(text) : null, cookie: res.headers.getSetCookie?.()[0]?.split(';')[0] };
  };
  const stamp = Date.now();
  const reg = (n) => call('POST', '/auth/register', { body: { username: `user${n}`, email: `u${n}-${stamp}@test.dev`, password: 'password123' } });
  const [a, b] = [await reg('a'), await reg('b')];
  const ta = a.json.accessToken, tb = b.json.accessToken;

  test.after(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); server.close(); });

  test('registration hashes the password and never returns it', async () => {
    assert.equal(a.status, 201);
    assert.equal(a.json.user.passwordHash, undefined);
    const doc = await User.findOne({ email: `ua-${stamp}@test.dev` }).select('+passwordHash');
    assert.notEqual(doc.passwordHash, 'password123');
    assert.ok(doc.passwordHash.startsWith('$2'));
  });
  test('login rejects a wrong password and accepts the right one', async () => {
    assert.equal((await call('POST', '/auth/login', { body: { email: `ua-${stamp}@test.dev`, password: 'wrongpass1' } })).status, 401);
    assert.equal((await call('POST', '/auth/login', { body: { email: `ua-${stamp}@test.dev`, password: 'password123' } })).status, 200);
  });
  test('refresh cookie yields a new access token', async () => {
    const r = await call('POST', '/auth/refresh', { cookie: a.cookie });
    assert.equal(r.status, 200); assert.ok(r.json.accessToken);
  });
  test('protected routes require a token', async () => {
    assert.equal((await call('GET', '/quests')).status, 401);
    assert.equal((await call('GET', '/dashboard')).status, 401);
  });
  test('users cannot read or complete each other\'s quests', async () => {
    const q = (await call('POST', '/quests', { token: ta, body: { title: 'Mine' } })).json.quest;
    assert.equal((await call('GET', `/quests/${q._id}`, { token: tb })).status, 404);
    assert.equal((await call('POST', `/quests/${q._id}/complete`, { token: tb })).status, 404);
    assert.equal((await call('DELETE', `/quests/${q._id}`, { token: tb })).status, 404);
  });
  test('quest CRUD + XP is derived from difficulty, not the client', async () => {
    const c = await call('POST', '/quests', { token: ta, body: { title: 'Hard one', difficulty: 'hard', xpReward: 99999 } });
    assert.equal(c.json.quest.xpReward, 50);
    const u = await call('PATCH', `/quests/${c.json.quest._id}`, { token: ta, body: { title: 'Renamed', status: 'completed' } });
    assert.equal(u.json.quest.title, 'Renamed'); assert.equal(u.json.quest.status, 'active'); // status is not mass-assignable
    assert.equal((await call('DELETE', `/quests/${c.json.quest._id}`, { token: ta })).status, 204);
  });
  test('XP is awarded once, even for repeated and concurrent completes', async () => {
    const before = (await call('GET', '/auth/me', { token: ta })).json.user.totalXp;
    const q = (await call('POST', '/quests', { token: ta, body: { title: 'Once', difficulty: 'medium' } })).json.quest;
    const results = await Promise.all(Array.from({ length: 5 }, () => call('POST', `/quests/${q._id}/complete`, { token: ta })));
    assert.equal(results.filter((r) => r.status === 200).length, 1);
    assert.equal(results.filter((r) => r.status === 409).length, 4);
    const after = (await call('GET', '/auth/me', { token: ta })).json.user;
    assert.equal(after.totalXp - before, 25);
    assert.equal(after.currentStreak, 1);
  });
  test('a habit can be completed once per day and awards XP once', async () => {
    const h = (await call('POST', '/habits', { token: tb, body: { title: 'Read' } })).json.habit;
    const results = await Promise.all([1, 2, 3].map(() => call('POST', `/habits/${h._id}/complete`, { token: tb })));
    assert.equal(results.filter((r) => r.status === 200).length, 1);
    const me = (await call('GET', '/auth/me', { token: tb })).json.user;
    assert.equal(me.totalXp, 10);
    const list = (await call('GET', '/habits', { token: tb })).json.habits;
    assert.equal(list[0].completedToday, true);
  });
}
