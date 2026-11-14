package com.hospital.repository;

import com.hospital.model.Department;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * MODEL (MVC): data access for the `department` table.
 * Read methods return raw rows (snake_case, like the TypeScript backend);
 * write methods take entities.
 */
@Repository
public class DepartmentRepository {

    private static final RowMapper<Department> MAPPER = (rs, rowNum) ->
            new Department(rs.getLong("department_id"), rs.getString("department_name"),
                    rs.getString("location"), rs.getString("phone"));

    private final JdbcTemplate jdbc;

    public DepartmentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Raw rows for the API (column names exactly as in MySQL). */
    public List<Map<String, Object>> findAllRows() {
        return Rows.normalize(jdbc.queryForList("SELECT * FROM department ORDER BY department_id"));
    }

    public Map<String, Object> findRowById(Long id) {
        var rows = jdbc.queryForList("SELECT * FROM department WHERE department_id = ?", id);
        return rows.isEmpty() ? null : Rows.normalize(rows.get(0));
    }

    public Department findById(Long id) {
        var list = jdbc.query("SELECT * FROM department WHERE department_id = ?", MAPPER, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public Department requireById(Long id) {
        Department d = findById(id);
        if (d == null) throw new NotFoundException("Department not found");
        return d;
    }

    public Long insert(Department d) {
        jdbc.update("INSERT INTO department (department_name, location, phone) VALUES (?, ?, ?)",
                d.getName(), d.getLocation(), d.getPhone());
        return jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(Long id, Department d) {
        jdbc.update("UPDATE department SET department_name = ?, location = ?, phone = ? WHERE department_id = ?",
                d.getName(), d.getLocation(), d.getPhone(), id);
    }

    public void delete(Long id) {
        jdbc.update("DELETE FROM department WHERE department_id = ?", id);
    }

    public long count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM department", Long.class);
    }
}
