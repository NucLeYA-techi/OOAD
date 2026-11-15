package com.hospital.repository;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Small helper: makes JDBC row values JSON-friendly and keeps column names
 * exactly as the database calls them (snake_case).
 *
 * (DATE/TIME/TIMESTAMP -> String; null stays null.)
 */
public final class Rows {

    private Rows() {}

    /** Normalize every value of one row. */
    public static Map<String, Object> normalize(Map<String, Object> row) {
        Map<String, Object> out = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : row.entrySet()) {
            out.put(e.getKey(), value(e.getValue()));
        }
        return out;
    }

    /** Normalize a list of rows. */
    public static List<Map<String, Object>> normalize(List<Map<String, Object>> rows) {
        return rows.stream().map(Rows::normalize).toList();
    }

    private static Object value(Object v) {
        if (v instanceof Date d) return d.toString();
        if (v instanceof Time t) return t.toString();
        if (v instanceof Timestamp ts) return ts.toString();
        return v;
    }
}
