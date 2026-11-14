package com.hospital.controller;

import com.hospital.service.HospitalService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** CONTROLLER (MVC): /api/stats (dashboard) and /api/health (liveness). */
@RestController
@RequestMapping("/api")
public class StatsHealthController {

    private final HospitalService service;
    private final JdbcTemplate jdbc;

    public StatsHealthController(HospitalService service, JdbcTemplate jdbc) {
        this.service = service;
        this.jdbc = jdbc;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.stats();
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            jdbc.execute("SELECT 1");
            return ResponseEntity.ok(Map.of("status", "ok", "service", "hms-backend-java"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("status", "error", "error", e.getMessage()));
        }
    }
}
