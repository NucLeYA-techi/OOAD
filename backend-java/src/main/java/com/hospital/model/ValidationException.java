package com.hospital.model;

import com.hospital.exception.AppException;

/** Thrown when an entity or request violates a business rule (-> HTTP 400). */
public class ValidationException extends AppException {
    public ValidationException(String message) {
        super(400, message);
    }
}
