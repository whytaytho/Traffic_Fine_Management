const pool = require("../config/db");

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function validateOfficerInput(body) {
  const requiredFields = ["name", "phone_no", "badge_no", "rank", "Station"];

  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return `${field} is required`;
    }
  }

  return null;
}

async function getOfficers(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    const sql = search
      ? `
        SELECT Officer_id, name, phone_no, badge_no, \`rank\`, \`Station\`
        FROM police_officer
        WHERE name LIKE ? OR badge_no LIKE ? OR \`rank\` LIKE ? OR \`Station\` LIKE ?
        ORDER BY Officer_id DESC
      `
      : `
        SELECT Officer_id, name, phone_no, badge_no, \`rank\`, \`Station\`
        FROM police_officer
        ORDER BY Officer_id DESC
      `;

    const params = search ? [search, search, search, search] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getOfficerById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid officer id");
    }

    const [rows] = await pool.query(
      `
        SELECT Officer_id, name, phone_no, badge_no, \`rank\`, \`Station\`
        FROM police_officer
        WHERE Officer_id = ?
      `,
      [id]
    );

    if (!rows.length) {
      res.status(404);
      throw new Error("Officer not found");
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function createOfficer(req, res, next) {
  try {
    const validationError = validateOfficerInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { name, phone_no, badge_no, rank, Station } = req.body;
    const [result] = await pool.query(
      `
        INSERT INTO police_officer (name, phone_no, badge_no, \`rank\`, \`Station\`)
        VALUES (?, ?, ?, ?, ?)
      `,
      [name.trim(), phone_no.trim(), badge_no.trim(), rank.trim(), Station.trim()]
    );

    const [rows] = await pool.query(
      "SELECT Officer_id, name, phone_no, badge_no, `rank`, `Station` FROM police_officer WHERE Officer_id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateOfficer(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid officer id");
    }

    const validationError = validateOfficerInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { name, phone_no, badge_no, rank, Station } = req.body;
    const [result] = await pool.query(
      `
        UPDATE police_officer
        SET name = ?, phone_no = ?, badge_no = ?, \`rank\` = ?, \`Station\` = ?
        WHERE Officer_id = ?
      `,
      [name.trim(), phone_no.trim(), badge_no.trim(), rank.trim(), Station.trim(), id]
    );

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Officer not found");
    }

    const [rows] = await pool.query(
      "SELECT Officer_id, name, phone_no, badge_no, `rank`, `Station` FROM police_officer WHERE Officer_id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteOfficer(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid officer id");
    }

    const [result] = await pool.query("DELETE FROM police_officer WHERE Officer_id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Officer not found");
    }

    res.json({ message: "Officer deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOfficer,
  deleteOfficer,
  getOfficerById,
  getOfficers,
  updateOfficer,
};
