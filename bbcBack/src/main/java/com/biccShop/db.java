package com.biccShop;

import java.sql.Connection;
import java.sql.DriverManager;

public class db {
    // Get database configuration from environment variables (same as Spring Boot)
    private final String dbHost = System.getenv().getOrDefault("DB_HOST", "localhost");
    private final String dbPort = System.getenv().getOrDefault("DB_PORT", "3306");
    private final String dbName = System.getenv().getOrDefault("DB_NAME", "bicc_db");
    private final String dbUser = System.getenv().getOrDefault("DB_USER", "root");
    private final String dbPassword = System.getenv().getOrDefault("DB_PASSWORD", "");

    private static db dbInstance = null;
    private Connection con;

    private db() {
        connect();
    }

    public static Connection get() {
        if (dbInstance == null) {
            dbInstance = new db();
        }
        return dbInstance.con;
    }

    private void connect() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName;
            con = DriverManager.getConnection(url, dbUser, dbPassword);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}