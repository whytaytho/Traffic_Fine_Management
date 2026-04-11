const pool = require("../config/db");

async function getDashboardSummary(req, res, next) {
  try {
    const [[counts]] = await pool.query(
      `
        SELECT
          (SELECT COUNT(*) FROM owner) AS total_owners,
          (SELECT COUNT(*) FROM vehicle) AS total_vehicles,
          (SELECT COUNT(*) FROM police_officer) AS total_officers,
          (SELECT COUNT(*) FROM fine) AS total_fines,
          (SELECT COUNT(*) FROM fine WHERE Payment_status = 'UNPAID') AS unpaid_fines_count,
          (SELECT COUNT(*) FROM fine WHERE Payment_status = 'PAID') AS paid_fines_count,
          (SELECT COUNT(*) FROM fine WHERE Payment_status = 'DISPUTED') AS disputed_fines_count,
          (SELECT COUNT(*) FROM fine WHERE Payment_status = 'CANCELLED') AS cancelled_fines_count,
          (SELECT COALESCE(SUM(Amount), 0) FROM fine WHERE Payment_status = 'UNPAID') AS total_unpaid_amount,
          (SELECT COALESCE(SUM(Amount), 0) FROM fine WHERE Payment_status = 'PAID') AS total_paid_amount
      `
    );

    res.json(counts);
  } catch (error) {
    next(error);
  }
}

async function getRepeatOffenders(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          v.id AS vehicle_id,
          v.license_plate_no,
          o.name AS owner_name,
          o.license_no,
          COUNT(f.Fine_id) AS total_fines,
          SUM(CASE WHEN f.Payment_status = 'UNPAID' THEN 1 ELSE 0 END) AS unpaid_fines,
          COALESCE(SUM(f.Amount), 0) AS total_amount
        FROM fine f
        JOIN vehicle v ON f.Vehicle_id = v.id
        JOIN owner o ON v.Owner_id = o.id
        GROUP BY v.id, v.license_plate_no, o.name, o.license_no
        HAVING COUNT(f.Fine_id) > 1
        ORDER BY total_fines DESC, total_amount DESC
        LIMIT 10
      `
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getUnpaidPerOwner(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          o.id AS owner_id,
          o.name AS owner_name,
          o.license_no,
          COUNT(f.Fine_id) AS unpaid_fines_count,
          COALESCE(SUM(f.Amount), 0) AS unpaid_total_amount
        FROM owner o
        JOIN vehicle v ON v.Owner_id = o.id
        JOIN fine f ON f.Vehicle_id = v.id
        WHERE f.Payment_status = 'UNPAID'
        GROUP BY o.id, o.name, o.license_no
        ORDER BY unpaid_total_amount DESC, unpaid_fines_count DESC
      `
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getCommonViolations(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          vt.id,
          vt.name,
          COUNT(f.Fine_id) AS fine_count,
          COALESCE(SUM(f.Amount), 0) AS total_amount
        FROM violation_type vt
        LEFT JOIN fine f ON f.Violation_type_id = vt.id
        GROUP BY vt.id, vt.name
        ORDER BY fine_count DESC, total_amount DESC
        LIMIT 10
      `
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getTopVehicles(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          v.id AS vehicle_id,
          v.license_plate_no,
          o.name AS owner_name,
          COUNT(f.Fine_id) AS fine_count,
          COALESCE(SUM(f.Amount), 0) AS total_amount
        FROM vehicle v
        LEFT JOIN owner o ON o.id = v.Owner_id
        LEFT JOIN fine f ON f.Vehicle_id = v.id
        GROUP BY v.id, v.license_plate_no, o.name
        ORDER BY fine_count DESC, total_amount DESC
        LIMIT 10
      `
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getTopOfficers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          p.Officer_id,
          p.name,
          p.badge_no,
          p.\`rank\` AS \`rank\`,
          COUNT(f.Fine_id) AS fine_count,
          COALESCE(SUM(f.Amount), 0) AS total_amount_issued
        FROM police_officer p
        LEFT JOIN fine f ON f.Police_Officer_id = p.Officer_id
        GROUP BY p.Officer_id, p.name, p.badge_no, p.\`rank\`
        ORDER BY fine_count DESC, total_amount_issued DESC
        LIMIT 10
      `
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getRevenue(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          DATE_FORMAT(Payment_date, '%Y-%m') AS payment_month,
          COUNT(*) AS paid_fines_count,
          COALESCE(SUM(Amount), 0) AS revenue
        FROM fine
        WHERE Payment_status = 'PAID' AND Payment_date IS NOT NULL
        GROUP BY DATE_FORMAT(Payment_date, '%Y-%m')
        ORDER BY payment_month DESC
      `
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getOldUnpaidFines(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          f.Fine_id,
          v.license_plate_no,
          o.name AS owner_name,
          vt.name AS violation_name,
          f.Date,
          f.Location,
          f.Amount,
          DATEDIFF(CURDATE(), f.Date) AS days_overdue
        FROM fine f
        JOIN vehicle v ON v.id = f.Vehicle_id
        JOIN owner o ON o.id = v.Owner_id
        JOIN violation_type vt ON vt.id = f.Violation_type_id
        WHERE f.Payment_status = 'UNPAID'
          AND f.Date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY f.Date ASC, f.Amount DESC
      `
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCommonViolations,
  getDashboardSummary,
  getOldUnpaidFines,
  getRepeatOffenders,
  getRevenue,
  getTopOfficers,
  getTopVehicles,
  getUnpaidPerOwner,
};
