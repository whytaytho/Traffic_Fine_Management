const pool = require("../config/db");

const fineListSelect = `
  SELECT
    f.Fine_id,
    f.Vehicle_id,
    f.Police_Officer_id,
    f.Violation_type_id,
    v.license_plate_no,
    o.id AS owner_id,
    o.name AS owner_name,
    o.license_no AS owner_license_no,
    p.name AS officer_name,
    p.badge_no,
    vt.name AS violation_name,
    f.Date,
    f.Time,
    f.Location,
    f.Amount,
    f.Payment_status,
    f.Payment_date,
    f.Remarks
  FROM fine f
  JOIN vehicle v ON f.Vehicle_id = v.id
  JOIN owner o ON v.Owner_id = o.id
  JOIN police_officer p ON f.Police_Officer_id = p.Officer_id
  JOIN violation_type vt ON f.Violation_type_id = vt.id
`;

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

async function ensureFineExists(id) {
  const [rows] = await pool.query("SELECT Fine_id FROM fine WHERE Fine_id = ?", [id]);
  return rows.length > 0;
}

async function ensureReferencedRecord(table, idColumn, value) {
  const [rows] = await pool.query(`SELECT ${idColumn} FROM ${table} WHERE ${idColumn} = ?`, [value]);
  return rows.length > 0;
}

async function fetchFineById(id) {
  const [rows] = await pool.query(
    `
      SELECT
        f.Fine_id,
        f.Vehicle_id,
        v.license_plate_no,
        v.Type AS vehicle_type,
        v.Brand AS vehicle_brand,
        v.Model AS vehicle_model,
        v.Colour AS vehicle_colour,
        o.id AS owner_id,
        o.name AS owner_name,
        o.phone_no AS owner_phone_no,
        o.email AS owner_email,
        o.address AS owner_address,
        o.license_no AS owner_license_no,
        f.Police_Officer_id,
        p.name AS officer_name,
        p.phone_no AS officer_phone_no,
        p.badge_no,
        p.\`rank\` AS officer_rank,
        p.\`Station\`,
        f.Violation_type_id,
        vt.name AS violation_name,
        vt.Description AS violation_description,
        vt.Default_amount,
        f.Date,
        f.Time,
        f.Location,
        f.Amount,
        f.Payment_status,
        f.Payment_date,
        f.Remarks
      FROM fine f
      JOIN vehicle v ON f.Vehicle_id = v.id
      JOIN owner o ON v.Owner_id = o.id
      JOIN police_officer p ON f.Police_Officer_id = p.Officer_id
      JOIN violation_type vt ON f.Violation_type_id = vt.id
      WHERE f.Fine_id = ?
    `,
    [id]
  );

  return rows[0] || null;
}

async function getFines(req, res, next) {
  try {
    const { status, search, ownerId, vehicleId, officerId, violationTypeId } = req.query;
    const filters = [];
    const params = [];

    if (status) {
      filters.push("f.Payment_status = ?");
      params.push(status);
    }

    if (ownerId && isValidId(ownerId)) {
      filters.push("o.id = ?");
      params.push(Number(ownerId));
    }

    if (vehicleId && isValidId(vehicleId)) {
      filters.push("f.Vehicle_id = ?");
      params.push(Number(vehicleId));
    }

    if (officerId && isValidId(officerId)) {
      filters.push("f.Police_Officer_id = ?");
      params.push(Number(officerId));
    }

    if (violationTypeId && isValidId(violationTypeId)) {
      filters.push("f.Violation_type_id = ?");
      params.push(Number(violationTypeId));
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      filters.push(`
        (
          v.license_plate_no LIKE ?
          OR o.name LIKE ?
          OR o.license_no LIKE ?
          OR p.name LIKE ?
          OR vt.name LIKE ?
          OR f.Location LIKE ?
          OR COALESCE(f.Remarks, '') LIKE ?
        )
      `);
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `${fineListSelect} ${whereClause} ORDER BY f.Fine_id DESC`,
      params
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getFineById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid fine id");
    }

    const fine = await fetchFineById(id);

    if (!fine) {
      res.status(404);
      throw new Error("Fine not found");
    }

    res.json(fine);
  } catch (error) {
    next(error);
  }
}

async function createFine(req, res, next) {
  let connection;

  try {
    connection = await pool.getConnection();
    const { vehicle_id, officer_id, violation_type_id, location, remarks } = req.body;

    if (!isValidId(vehicle_id) || !isValidId(officer_id) || !isValidId(violation_type_id)) {
      res.status(400);
      throw new Error("vehicle_id, officer_id, and violation_type_id must be valid ids");
    }

    if (!location || String(location).trim() === "") {
      res.status(400);
      throw new Error("location is required");
    }

    const [vehicleRows] = await connection.query("SELECT id FROM vehicle WHERE id = ?", [vehicle_id]);
    const [officerRows] = await connection.query("SELECT Officer_id FROM police_officer WHERE Officer_id = ?", [
      officer_id,
    ]);
    const [violationRows] = await connection.query("SELECT id FROM violation_type WHERE id = ?", [
      violation_type_id,
    ]);

    if (!vehicleRows.length || !officerRows.length || !violationRows.length) {
      res.status(400);
      throw new Error("Vehicle, officer, or violation type not found");
    }

    await connection.query("CALL AddFine(?, ?, ?, ?, ?)", [
      Number(vehicle_id),
      Number(officer_id),
      Number(violation_type_id),
      location.trim(),
      remarks ? remarks.trim() : null,
    ]);

    const [lastInsertRows] = await connection.query("SELECT LAST_INSERT_ID() AS fineId");
    let fineId = lastInsertRows[0] ? Number(lastInsertRows[0].fineId) : 0;

    if (!fineId) {
      const [fallbackRows] = await connection.query(
        `
          SELECT Fine_id
          FROM fine
          WHERE Vehicle_id = ?
            AND Police_Officer_id = ?
            AND Violation_type_id = ?
            AND Location = ?
          ORDER BY Fine_id DESC
          LIMIT 1
        `,
        [vehicle_id, officer_id, violation_type_id, location.trim()]
      );
      fineId = fallbackRows[0] ? Number(fallbackRows[0].Fine_id) : 0;
    }

    const fine = fineId ? await fetchFineById(fineId) : null;

    res.status(201).json({
      message: "Fine created successfully",
      fine,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function updateFine(req, res, next) {
  try {
    const { id } = req.params;
    const { vehicle_id, officer_id, violation_type_id, location, remarks } = req.body;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid fine id");
    }

    if (!(await ensureFineExists(id))) {
      res.status(404);
      throw new Error("Fine not found");
    }

    if (!location || String(location).trim() === "") {
      res.status(400);
      throw new Error("location is required");
    }

    if (vehicle_id !== undefined && !isValidId(vehicle_id)) {
      res.status(400);
      throw new Error("vehicle_id must be a valid id");
    }

    if (officer_id !== undefined && !isValidId(officer_id)) {
      res.status(400);
      throw new Error("officer_id must be a valid id");
    }

    if (violation_type_id !== undefined && !isValidId(violation_type_id)) {
      res.status(400);
      throw new Error("violation_type_id must be a valid id");
    }

    if (vehicle_id && !(await ensureReferencedRecord("vehicle", "id", vehicle_id))) {
      res.status(400);
      throw new Error("Vehicle not found");
    }

    if (
      officer_id &&
      !(await ensureReferencedRecord("police_officer", "Officer_id", officer_id))
    ) {
      res.status(400);
      throw new Error("Officer not found");
    }

    if (
      violation_type_id &&
      !(await ensureReferencedRecord("violation_type", "id", violation_type_id))
    ) {
      res.status(400);
      throw new Error("Violation type not found");
    }

    const [currentRows] = await pool.query(
      `
        SELECT Vehicle_id, Police_Officer_id, Violation_type_id, Location, Remarks
        FROM fine
        WHERE Fine_id = ?
      `,
      [id]
    );

    const currentFine = currentRows[0];
    const nextVehicleId = vehicle_id ? Number(vehicle_id) : currentFine.Vehicle_id;
    const nextOfficerId = officer_id ? Number(officer_id) : currentFine.Police_Officer_id;
    const nextViolationTypeId = violation_type_id
      ? Number(violation_type_id)
      : currentFine.Violation_type_id;
    const nextLocation = location.trim();
    const nextRemarks =
      remarks !== undefined ? (remarks ? remarks.trim() : null) : currentFine.Remarks;

    const [violationAmountRows] = await pool.query(
      "SELECT Default_amount FROM violation_type WHERE id = ?",
      [nextViolationTypeId]
    );
    const nextAmount = violationAmountRows[0].Default_amount;

    await pool.query(
      `
        UPDATE fine
        SET Vehicle_id = ?,
            Police_Officer_id = ?,
            Violation_type_id = ?,
            Location = ?,
            Remarks = ?,
            Amount = ?
        WHERE Fine_id = ?
      `,
      [
        nextVehicleId,
        nextOfficerId,
        nextViolationTypeId,
        nextLocation,
        nextRemarks,
        nextAmount,
        id,
      ]
    );

    const fine = await fetchFineById(id);
    res.json(fine);
  } catch (error) {
    next(error);
  }
}

async function deleteFine(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid fine id");
    }

    const [result] = await pool.query("DELETE FROM fine WHERE Fine_id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404);
      throw new Error("Fine not found");
    }

    res.json({ message: "Fine deleted successfully" });
  } catch (error) {
    next(error);
  }
}

async function executeFineProcedure(req, res, next, procedureName, params, successMessage) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400);
      throw new Error("Invalid fine id");
    }

    if (!(await ensureFineExists(id))) {
      res.status(404);
      throw new Error("Fine not found");
    }

    await pool.query(`CALL ${procedureName}(${params.map(() => "?").join(", ")})`, params);
    const fine = await fetchFineById(id);

    res.json({
      message: successMessage,
      fine,
    });
  } catch (error) {
    next(error);
  }
}

async function payFine(req, res, next) {
  return executeFineProcedure(req, res, next, "PayFine", [Number(req.params.id)], "Fine paid successfully");
}

async function disputeFine(req, res, next) {
  return executeFineProcedure(
    req,
    res,
    next,
    "RaiseDispute",
    [Number(req.params.id)],
    "Fine dispute raised successfully"
  );
}

async function cancelFine(req, res, next) {
  return executeFineProcedure(
    req,
    res,
    next,
    "CancelFine",
    [Number(req.params.id)],
    "Fine cancelled successfully"
  );
}

async function resolveDispute(req, res, next) {
  const { decision } = req.body;

  if (!decision || !["ACCEPT", "REJECT"].includes(String(decision).toUpperCase())) {
    res.status(400);
    return next(new Error("decision must be ACCEPT or REJECT"));
  }

  return executeFineProcedure(
    req,
    res,
    next,
    "ResolveDispute",
    [Number(req.params.id), String(decision).toUpperCase()],
    "Dispute resolved successfully"
  );
}

module.exports = {
  cancelFine,
  createFine,
  deleteFine,
  disputeFine,
  getFineById,
  getFines,
  payFine,
  resolveDispute,
  updateFine,
};
