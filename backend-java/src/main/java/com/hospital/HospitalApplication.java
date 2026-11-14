package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point. Spring Boot's DataSource is a container-managed Singleton —
 * the Java equivalent of the DatabaseManager singleton in the TypeScript
 * backend (one shared connection pool for the whole application).
 */
@SpringBootApplication
public class HospitalApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalApplication.class, args);
    }
}
