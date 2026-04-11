function DataTable({ columns, data, emptyMessage = "No records found.", actions }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row) => (
              <tr key={row.id || row.Fine_id || row.Officer_id || `${row.name}-${row.license_plate_no}`}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key] ?? "-"}
                  </td>
                ))}
                {actions ? <td>{actions(row)}</td> : null}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-state">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
