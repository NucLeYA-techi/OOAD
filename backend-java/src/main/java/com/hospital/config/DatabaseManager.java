package com.hospital.config;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * DatabaseManager — the one shared database connection (GoF Singleton).
 *
 * This is the complete pattern in 3 lines:
 *   1. a private static field holds the single instance,
 *   2. a private constructor means nobody can create a second one,
 *   3. a public static get() is the only way to reach the shared instance.
 *
 * The DataSource (connection pool) itself is provided by Spring, which
 * creates it exactly once at startup — so there is one instance and one
 * pool for the whole application.
 */
@Component
public final class DatabaseManager {

    // 1. the single instance, held in a private static field
    private static DatabaseManager instance;

    // the shared connection pool (given by Spring, created once)
    private final DataSource dataSource;

    // 2. private constructor: only Spring (once) may call this
    private DatabaseManager(DataSource dataSource) {
        this.dataSource = dataSource;
        instance = this; // fill the single-instance slot
    }

    // 3. the only way in: get the shared instance
    public static DatabaseManager get() {
        return instance;
    }

    public DataSource getDataSource() {
        return dataSource;
    }
}
