package com.hospital.controller;

import com.hospital.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER (MVC): maps HTTP to the service. No SQL, no validation here —
 * entities validate, the service coordinates, Jackson renders the VIEW (JSON).
 */
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final HospitalService service;

    public DepartmentController(HospitalService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return service.listDepartments();
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        return service.getDepartment(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(201).body(service.createDepartment(body));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return service.updateDepartment(id, body);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        return service.deleteDepartment(id);
    }
}
