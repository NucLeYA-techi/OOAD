package com.hospital.exception;

/** Base class for errors that map cleanly to one HTTP status. */
public abstract class AppException extends RuntimeException {

    private final int status;

    protected AppException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
