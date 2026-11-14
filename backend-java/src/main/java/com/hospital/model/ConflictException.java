package com.hospital.model;

import com.hospital.exception.AppException;

/** Thrown when a conflict blocks the operation, e.g. double-booking (-> HTTP 409). */
public class ConflictException extends AppException {
    public ConflictException(String message) {
        super(409, message);
    }
}
