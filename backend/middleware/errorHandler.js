function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err && err.code === "ER_SIGNAL_EXCEPTION") {
    return res.status(400).json({ message: err.sqlMessage || err.message });
  }

  if (err && err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({ message: err.sqlMessage || "Duplicate entry" });
  }

  if (err && err.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(400).json({
      message: "This record cannot be deleted because it is still referenced by other records.",
    });
  }

  return res.status(statusCode).json({
    message: err.message || "Something went wrong",
  });
}

module.exports = errorHandler;
