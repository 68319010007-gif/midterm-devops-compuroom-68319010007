require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const VERSION = '1.0.0';

const VALID_STATUS = ['active', 'repair', 'disposed'];

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: VERSION });
});

app.get('/api/computers', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM computers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/computers/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM computers WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลเครื่องคอมพิวเตอร์' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/computers', async (req, res) => {
  try {
    const { asset_code, brand_model, cpu, ram_gb, room, status } = req.body;

    if (!asset_code || !brand_model || !cpu || ram_gb == null || !room || !status) {
      return res.status(400).json({
        error: 'กรุณาระบุ asset_code, brand_model, cpu, ram_gb, room, status',
      });
    }

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({
        error: 'status ต้องเป็น active, repair หรือ disposed',
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO computers (asset_code, brand_model, cpu, ram_gb, room, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        asset_code.trim(),
        brand_model.trim(),
        cpu.trim(),
        parseInt(ram_gb, 10),
        room.trim(),
        status,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'รหัสครุภัณฑ์นี้มีอยู่แล้ว' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/computers/:id', async (req, res) => {
  try {
    const { asset_code, brand_model, cpu, ram_gb, room, status } = req.body;

    if (!asset_code || !brand_model || !cpu || ram_gb == null || !room || !status) {
      return res.status(400).json({
        error: 'กรุณาระบุ asset_code, brand_model, cpu, ram_gb, room, status',
      });
    }

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({
        error: 'status ต้องเป็น active, repair หรือ disposed',
      });
    }

    const { rows } = await pool.query(
      `UPDATE computers
       SET asset_code = $1, brand_model = $2, cpu = $3, ram_gb = $4,
           room = $5, status = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        asset_code.trim(),
        brand_model.trim(),
        cpu.trim(),
        parseInt(ram_gb, 10),
        room.trim(),
        status,
        req.params.id,
      ]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลเครื่องคอมพิวเตอร์' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'รหัสครุภัณฑ์นี้มีอยู่แล้ว' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/computers/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM computers WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลเครื่องคอมพิวเตอร์' });
    }
    res.json({ message: 'ลบข้อมูลสำเร็จ', deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS computers (
      id          SERIAL PRIMARY KEY,
      asset_code  VARCHAR(50)  NOT NULL UNIQUE,
      brand_model VARCHAR(150) NOT NULL,
      cpu         VARCHAR(100) NOT NULL,
      ram_gb      INTEGER      NOT NULL,
      room        VARCHAR(50)  NOT NULL,
      status      VARCHAR(20)  NOT NULL DEFAULT 'active',
      created_at  TIMESTAMPTZ  DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM computers');
  if (parseInt(rows[0].count, 10) === 0) {
    await pool.query(`
      INSERT INTO computers (asset_code, brand_model, cpu, ram_gb, room, status) VALUES
      ('PC-LAB-001', 'Dell OptiPlex 7090', 'Intel Core i5-11500', 8,  'ห้อง 101', 'active'),
      ('PC-LAB-002', 'HP ProDesk 400 G7', 'Intel Core i3-10100', 8,  'ห้อง 101', 'active'),
      ('PC-LAB-003', 'Lenovo ThinkCentre M720', 'Intel Core i7-9700', 16, 'ห้อง 102', 'repair'),
      ('PC-LAB-004', 'Acer Veriton X', 'Intel Core i5-10400', 8,  'ห้อง 103', 'disposed')
    `);
  }
}

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`CompuRoom API running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('DB init failed:', err.message);
    process.exit(1);
  });
}

module.exports = app;
