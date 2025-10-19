package com.biccShop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class JasperReportsConfig {

    @Value("${jasper.reports.path:/app/jasper}")
    private String jasperReportsPath;

    @Value("${reports.output.path:/app/reports}")
    private String reportsOutputPath;

    // Cache for compiled reports
    private final Map<String, JasperReport> compiledReports = new HashMap<>();

    /**
     * Get compiled JasperReport from cache or compile if not exists
     * 
     * @param reportName - name of the .jrxml file without extension
     * @return compiled JasperReport
     */
    public JasperReport getCompiledReport(String reportName) throws JRException, IOException {
        if (compiledReports.containsKey(reportName)) {
            return compiledReports.get(reportName);
        }

        JasperReport compiledReport = compileReport(reportName);
        compiledReports.put(reportName, compiledReport);
        return compiledReport;
    }

    /**
     * Compile JasperReport from .jrxml file
     * 
     * @param reportName - name of the .jrxml file without extension
     * @return compiled JasperReport
     */
    private JasperReport compileReport(String reportName) throws JRException, IOException {
        String reportFileName = reportName + ".jrxml";

        try {
            // First try to load from classpath (for IDE/local development)
            Resource resource = new ClassPathResource("jasper/" + reportFileName);
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream()) {
                    return JasperCompileManager.compileReport(inputStream);
                }
            }
        } catch (Exception e) {
            // If classpath loading fails, try file system (for Docker)
            System.out.println("Classpath loading failed, trying file system: " + e.getMessage());
        }

        // Fallback to file system path (for Docker containers)
        String filePath = jasperReportsPath + "/" + reportFileName;
        try {
            return JasperCompileManager.compileReport(filePath);
        } catch (Exception e) {
            throw new JRException("Could not compile report: " + reportName +
                    " from path: " + filePath + ". Error: " + e.getMessage(), e);
        }
    }

    /**
     * Get the reports output directory path
     */
    public String getReportsOutputPath() {
        return reportsOutputPath;
    }

    /**
     * Get the jasper templates directory path
     */
    public String getJasperReportsPath() {
        return jasperReportsPath;
    }

    /**
     * Clear compiled reports cache
     */
    public void clearCache() {
        compiledReports.clear();
    }
}