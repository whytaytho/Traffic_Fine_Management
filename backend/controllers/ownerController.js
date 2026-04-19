const pool = require("../config/db");

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function normalizeOptionalField(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = String(value).trim();
  return trimmedValue === "" ? null : trimmedValue;
}

function validateOwnerInput(body) {
  const requiredFields = ["name", "phone_no", "email", "address", "license_no"];

  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return `${field} is required`;
    }
  }

  return null;
}

async function getOwners(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    const sql = search
      ? `
        SELECT id, name, phone_no, email, address, license_no, aadhar_id
        FROM owner
        WHERE name LIKE ? OR email LIKE ? OR license_no LIKE ? OR aadhar_id LIKE ?
        ORDER BY id DESC
      `
      : `
        SELECT id, name, phone_no, email, address, license_no, aadhar_id
        FROM owner
        ORDER BY id DESC
      `;

    const params = search ? [search, search, search, search] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getOwnerById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid owner id");
    }

    const [rows] = await pool.query(
      `
        SELECT id, name, phone_no, email, address, license_no, aadhar_id
        FROM owner
        WHERE id = ?
      `,
      [id]
    );

    if (!rows.length) {
      res.status(404);
      throw new Error("Owner not found");
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function createOwner(req, res, next) {
  try {
    const validationError = validateOwnerInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { name, phone_no, email, address, license_no, aadhar_id } = req.body;
    const [result] = await pool.query(
      `
        INSERT INTO owner (name, phone_no, email, address, license_no, aadhar_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        phone_no.trim(),
        email.trim(),
        address.trim(),
        license_no.trim(),
        normalizeOptionalField(aadhar_id),
      ]
    );

    const [rows] = await pool.query("SELECT * FROM owner WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateOwner(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid owner id");
    }

    const validationError = validateOwnerInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { name, phone_no, email, address, license_no, aadhar_id } = req.body;
    const [result] = await pool.query(
      `
        UPDATE owner
        SET name = ?, phone_no = ?, email = ?, address = ?, license_no = ?, aadhar_id = ?
        WHERE id = ?
      `,
      [
        name.trim(),
        phone_no.trim(),
        email.trim(),
        address.trim(),
        license_no.trim(),
        normalizeOptionalField(aadhar_id),
        id,
      ]
    );

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Owner not found");
    }

    const [rows] = await pool.query("SELECT * FROM owner WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteOwner(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid owner id");
    }

    const [result] = await pool.query("DELETE FROM owner WHERE id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Owner not found");
    }

    res.json({ message: "Owner deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOwner,
  deleteOwner,
  getOwnerById,
  getOwners,
  updateOwner,
};
