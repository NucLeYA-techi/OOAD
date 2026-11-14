package com.hospital.repository;

import com.hospital.exception.AppException;

/** Thrown when a record does not exist (-> HTTP 404). */
public class NotFoundException extends AppException {
    public NotFoundException(String message) {
        super(404, message);
    }
}
