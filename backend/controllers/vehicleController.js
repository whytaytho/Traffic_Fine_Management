const pool = require("../config/db");

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function validateVehicleInput(body) {
  const requiredFields = ["license_plate_no", "Owner_id", "Brand", "Model"];

  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return `${field} is required`;
    }
  }

  if (!isValidId(body.Owner_id)) {
    return "Owner_id must be a valid id";
  }

  return null;
}

async function ownerExists(ownerId) {
  const [rows] = await pool.query("SELECT id FROM owner WHERE id = ?", [ownerId]);
  return rows.length > 0;
}

async function getVehicles(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    const sql = search
      ? `
        SELECT
          v.id,
          v.license_plate_no,
          v.Owner_id,
          o.name AS owner_name,
          v.Type,
          v.Brand,
          v.Model,
          v.Colour
        FROM vehicle v
        JOIN owner o ON o.id = v.Owner_id
        WHERE v.license_plate_no LIKE ?
          OR o.name LIKE ?
          OR v.Brand LIKE ?
          OR v.Model LIKE ?
        ORDER BY v.id DESC
      `
      : `
        SELECT
          v.id,
          v.license_plate_no,
          v.Owner_id,
          o.name AS owner_name,
          v.Type,
          v.Brand,
          v.Model,
          v.Colour
        FROM vehicle v
        JOIN owner o ON o.id = v.Owner_id
        ORDER BY v.id DESC
      `;

    const params = search ? [search, search, search, search] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getVehicleById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid vehicle id");
    }

    const [rows] = await pool.query(
      `
        SELECT
          v.id,
          v.license_plate_no,
          v.Owner_id,
          o.name AS owner_name,
          v.Type,
          v.Brand,
          v.Model,
          v.Colour
        FROM vehicle v
        JOIN owner o ON o.id = v.Owner_id
        WHERE v.id = ?
      `,
      [id]
    );

    if (!rows.length) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function createVehicle(req, res, next) {
  try {
    const validationError = validateVehicleInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { license_plate_no, Owner_id, Type, Brand, Model, Colour } = req.body;

    if (!(await ownerExists(Owner_id))) {
      res.status(400);
      throw new Error("Owner not found");
    }

    const [result] = await pool.query(
      `
        INSERT INTO vehicle (license_plate_no, Owner_id, Type, Brand, Model, Colour)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        license_plate_no.trim(),
        Number(Owner_id),
        Type ? Type.trim() : null,
        Brand.trim(),
        Model.trim(),
        Colour ? Colour.trim() : null,
      ]
    );

    const [rows] = await pool.query(
      `
        SELECT
          v.id,
          v.license_plate_no,
          v.Owner_id,
          o.name AS owner_name,
          v.Type,
          v.Brand,
          v.Model,
          v.Colour
        FROM vehicle v
        JOIN owner o ON o.id = v.Owner_id
        WHERE v.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid vehicle id");
    }

    const validationError = validateVehicleInput(req.body);

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const { license_plate_no, Owner_id, Type, Brand, Model, Colour } = req.body;

    if (!(await ownerExists(Owner_id))) {
      res.status(400);
      throw new Error("Owner not found");
    }

    const [result] = await pool.query(
      `
        UPDATE vehicle
        SET license_plate_no = ?, Owner_id = ?, Type = ?, Brand = ?, Model = ?, Colour = ?
        WHERE id = ?
      `,
      [
        license_plate_no.trim(),
        Number(Owner_id),
        Type ? Type.trim() : null,
        Brand.trim(),
        Model.trim(),
        Colour ? Colour.trim() : null,
        id,
      ]
    );

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    const [rows] = await pool.query(
      `
        SELECT
          v.id,
          v.license_plate_no,
          v.Owner_id,
          o.name AS owner_name,
          v.Type,
          v.Brand,
          v.Model,
          v.Colour
        FROM vehicle v
        JOIN owner o ON o.id = v.Owner_id
        WHERE v.id = ?
      `,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteVehicle(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid vehicle id");
    }

    const [result] = await pool.query("DELETE FROM vehicle WHERE id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle,
};
