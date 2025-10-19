package com.biccShop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.biccShop.config.JasperReportsConfig;

import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

import java.util.Collection;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private JasperReportsConfig jasperConfig;

    /**
     * Generate PDF report from data and return as ResponseEntity
     * 
     * @param reportName - name of the .jrxml file without extension
     * @param data       - collection of data objects for the report
     * @param parameters - parameters map for the report
     * @param fileName   - name for the downloaded file
     * @return ResponseEntity with PDF content
     */
    public ResponseEntity<byte[]> generatePdfReport(String reportName, Collection<?> data,
            Map<String, Object> parameters, String fileName) {
        try {
            // Get compiled report
            JasperReport compileReport = jasperConfig.getCompiledReport(reportName);

            // Create data source
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data, false);

            // Fill report with data
            JasperPrint jasperPrint = JasperFillManager.fillReport(compileReport, parameters, dataSource);

            // Export to PDF
            byte[] pdfData = JasperExportManager.exportReportToPdf(jasperPrint);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "inline; filename=" + fileName + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfData);

        } catch (Exception e) {
            System.err.println("Error generating report: " + reportName + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate PDF report without data (for reports that get data internally)
     * 
     * @param reportName - name of the .jrxml file without extension
     * @param parameters - parameters map for the report
     * @param fileName   - name for the downloaded file
     * @return ResponseEntity with PDF content
     */
    public ResponseEntity<byte[]> generatePdfReport(String reportName, Map<String, Object> parameters,
            String fileName) {
        try {
            // Get compiled report
            JasperReport compileReport = jasperConfig.getCompiledReport(reportName);

            // Fill report with parameters only
            JasperPrint jasperPrint = JasperFillManager.fillReport(compileReport, parameters,
                    new net.sf.jasperreports.engine.JREmptyDataSource());

            // Export to PDF
            byte[] pdfData = JasperExportManager.exportReportToPdf(jasperPrint);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "inline; filename=" + fileName + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfData);

        } catch (Exception e) {
            System.err.println("Error generating report: " + reportName + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}