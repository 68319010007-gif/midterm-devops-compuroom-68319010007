const request = require('supertest');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const pool = require('../db');
const app = require('../index');

describe('CompuRoom API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns status and version', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', version: '1.0.0' });
  });

  test('GET /api/computers/:id returns 404 when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/computers/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('ไม่พบข้อมูลเครื่องคอมพิวเตอร์');
  });

  test('POST /api/computers returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/computers')
      .send({ asset_code: 'PC-TEST-001' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('กรุณาระบุ');
  });

  test('POST /api/computers creates a computer', async () => {
    const payload = {
      asset_code: 'PC-TEST-002',
      brand_model: 'Dell OptiPlex',
      cpu: 'Intel Core i5',
      ram_gb: 16,
      room: 'ห้อง 201',
      status: 'active',
    };

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, ...payload }],
    });

    const res = await request(app).post('/api/computers').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.asset_code).toBe('PC-TEST-002');
  });
});
