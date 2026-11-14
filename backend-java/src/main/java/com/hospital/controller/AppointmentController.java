package com.hospital.controller;

import com.hospital.model.ValidationException;
import com.hospital.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** CONTROLLER (MVC): /api/appointments — thin, delegates to HospitalService. */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final HospitalService service;

    public AppointmentController(HospitalService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return service.listAppointments();
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        return service.getAppointment(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(201).body(service.createAppointment(body));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return service.updateAppointment(id, body);
    }

    @PatchMapping("/{id}/status")
    public Map<String, Object> setStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object status = body.get("status");
        if (status == null) throw new ValidationException("status is required.");
        return service.setAppointmentStatus(id, String.valueOf(status));
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        return service.deleteAppointment(id);
    }
}
