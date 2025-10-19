# JasperReports Docker Configuration Guide

## What Was Added

### 1. Dockerfile Updates
- **Added font libraries**: `fontconfig`, `libfreetype6`, `dejavu-fonts-core` etc. for proper PDF rendering
- **Copied JasperReports templates**: Templates are copied from `src/main/resources/jasper/` to `/app/jasper/` in container
- **Created reports directory**: `/app/reports` for storing generated reports
- **Added JVM options**: `JAVA_OPTS` for headless mode and UTF-8 encoding

### 2. Docker Compose Updates
- **Added environment variables**: 
  - `JASPER_REPORTS_PATH=/app/jasper`
  - `REPORTS_OUTPUT_PATH=/app/reports`
- **Added volumes**:
  - `reports_data:/app/reports` - persistent storage for generated reports
  - `./bbcBack/src/main/resources/jasper:/app/jasper:ro` - read-only access to templates
- **Added reports_data volume** to volumes section

### 3. Application Configuration
- **Added JasperReportsConfig.java**: Service to handle report compilation and caching
- **Updated application.properties**: Added jasper reports configuration properties

## How to Use in Your Controllers

### Before (Old Way - Won't Work in Docker):
```java
JasperReport compileReport = JasperCompileManager
    .compileReport(new FileInputStream("src/main/resources/jasper/VendorSales.jrxml"));
```

### After (New Way - Works in Docker and IDE):
```java
@Autowired
JasperReportsConfig jasperConfig;

// In your method:
JasperReport compileReport = jasperConfig.getCompiledReport("VendorSales");
```

## Example Controller Update

Replace your report methods in BbcController.java:

```java
@Autowired
JasperReportsConfig jasperConfig;

@GetMapping(value = "/reports/vendor-sales", produces = MediaType.APPLICATION_PDF_VALUE)
public ResponseEntity<byte[]> getVendorSalesReport(@RequestParam String startDate, @RequestParam String endDate) {
    try {
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(
            da.getAdminSalesReportGroupBySeller(startDate, endDate), false);
        Map<String, Object> param = new HashMap<>();
        
        // Use the new configuration service
        JasperReport compileReport = jasperConfig.getCompiledReport("VendorSales");
        
        JasperPrint jasperPrint = JasperFillManager.fillReport(compileReport, param, dataSource);
        byte[] data = JasperExportManager.exportReportToPdf(jasperPrint);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=vendor-sales-report.pdf");
        return ResponseEntity.ok().headers(headers).contentType(MediaType.APPLICATION_PDF).body(data);
        
    } catch (Exception e) {
        // Proper error handling
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

## Benefits

1. **Works in both Docker and IDE**: Automatic fallback between classpath and file system
2. **Report caching**: Compiled reports are cached for better performance
3. **Configurable paths**: Easy to change paths via environment variables
4. **Proper fonts**: Font libraries ensure PDF rendering works correctly in containers
5. **Persistent storage**: Generated reports can be stored persistently

## Next Steps

1. Update all your report controller methods to use `jasperConfig.getCompiledReport("ReportName")`
2. Build and deploy: `docker-compose up --build`
3. Test your reports to ensure they generate correctly

## Available Reports to Update
- VendorSales.jrxml
- ProductDetails.jrxml
- FavoriteItem.jrxml
- CustomerReport.jrxml
- Invoice.jrxml
- StockAlert.jrxml
- TopSelling.jrxml
- SellerReport.jrxml
- CustomerOrders.jrxml
- AdminProfits.jrxml