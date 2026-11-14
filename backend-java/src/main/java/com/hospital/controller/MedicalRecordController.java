package com.hospital.controller;

import com.hospital.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** CONTROLLER (MVC): /api/medical-records — thin, delegates to HospitalService. */
@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final HospitalService service;

    public MedicalRecordController(HospitalService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return service.listMedicalRecords();
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        return service.getMedicalRecord(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(201).body(service.createMedicalRecord(body));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return service.updateMedicalRecord(id, body);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        return service.deleteMedicalRecord(id);
    }
}
