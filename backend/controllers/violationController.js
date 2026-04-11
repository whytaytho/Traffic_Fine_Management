const pool = require("../config/db");

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function validateViolationInput(body) {
  if (!body.name || String(body.name).trim() === "") {
    return "name is required";
  }

  if (body.Default_amount === undefined || body.Default_amount === null || body.Default_amount === "") {
    return "Default_amount is required";
  }

  if (Number.isNaN(Number(body.Default_amount)) || Number(body.Default_amount) < 0) {
    return "Default_amount must be a valid non-negative number";
  }

  return null;
}

async function getViolations(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    const sql = search
      ? `
        SELECT id, name, Description, Default_amount
        FROM violation_type
        WHERE name LIKE ? OR Description LIKE ?
        ORDER BY id DESC
      `
      : `
        SELECT id, name, Description, Default_amount
        FROM violation_type
        ORDER BY id DESC
      `;

    const params = search ? [search, search] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getViolationById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid violation id");
    }

    const [rows] = await pool.query(
      `
        SELECT id, name, Description, Default_amount
        FROM violation_type
        WHERE id = ?
      `,
      [id]
    );

    if (!rows.length) {
      res.status(404);
      throw new Error("Violation type not found");
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function createViolation(req, res, next) {
  try {
    const validationError = validateViolationInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { name, Description, Default_amount } = req.body;
    const [result] = await pool.query(
      `
        INSERT INTO violation_type (name, Description, Default_amount)
        VALUES (?, ?, ?)
      `,
      [name.trim(), Description ? Description.trim() : null, Number(Default_amount)]
    );

    const [rows] = await pool.query(
      "SELECT id, name, Description, Default_amount FROM violation_type WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateViolation(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid violation id");
    }

    const validationError = validateViolationInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { name, Description, Default_amount } = req.body;
    const [result] = await pool.query(
      `
        UPDATE violation_type
        SET name = ?, Description = ?, Default_amount = ?
        WHERE id = ?
      `,
      [name.trim(), Description ? Description.trim() : null, Number(Default_amount), id]
    );

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Violation type not found");
    }

    const [rows] = await pool.query(
      "SELECT id, name, Description, Default_amount FROM violation_type WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteViolation(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid violation id");
    }

    const [result] = await pool.query("DELETE FROM violation_type WHERE id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Violation type not found");
    }

    res.json({ message: "Violation type deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createViolation,
  deleteViolation,
  getViolationById,
  getViolations,
  updateViolation,
};
