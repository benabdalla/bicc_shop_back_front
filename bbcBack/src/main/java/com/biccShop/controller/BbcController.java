package com.biccShop.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.biccShop.dao.BbcDA;
import com.biccShop.service.ReportService;

@Controller
public class BbcController {

	@Autowired
	BbcDA da;

	@Autowired
	ReportService reportService;

	@GetMapping(value = "/reports/vendor-sales", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getAdminSalesReportGroupBySeller(@RequestParam String startDate,
			@RequestParam String endDate) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("startDate", startDate);
		parameters.put("endDate", endDate);

		return reportService.generatePdfReport(
				"VendorSales",
				da.getAdminSalesReportGroupBySeller(startDate, endDate),
				parameters,
				"vendor-sales-report");
	}

	@GetMapping(value = "/reports/product-details", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getProductDetailsReport() {
		Map<String, Object> parameters = new HashMap<>();

		return reportService.generatePdfReport(
				"ProductDetails",
				da.getProductDetailsReport(),
				parameters,
				"product-details-report");
	}

	@GetMapping(value = "/reports/favorite-item", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getFavoriteItemReport() {
		Map<String, Object> parameters = new HashMap<>();

		return reportService.generatePdfReport(
				"FavoriteItem",
				da.getFavoriteItemReport(),
				parameters,
				"favorite-item-report");
	}

	@GetMapping(value = "/reports/customer", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getCustomerReport() {
		Map<String, Object> parameters = new HashMap<>();

		return reportService.generatePdfReport(
				"CustomerReport",
				da.getCustomerReport(),
				parameters,
				"customer-report");
	}

	@GetMapping(value = "/reports/admin-profit", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getAdminProfitReport() {
		List<HashMap<String, String>> l = da.getAdminProfitReport();
		double totalSale = 0;
		double totalProfit = 0;
		for (HashMap<String, String> a : l) {
			totalSale += Double.parseDouble(a.get("sales"));
			totalProfit += Double.parseDouble(a.get("platformProfit"));
		}

		Map<String, Object> parameters = new HashMap<>();
		parameters.put("totalSale", String.valueOf(totalSale));
		parameters.put("totalProfit", String.valueOf(totalProfit));

		return reportService.generatePdfReport(
				"AdminProfits",
				l,
				parameters,
				"admin-profit-report");
	}

	@GetMapping(value = "/reports/seller", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getSellerReport() {
		Map<String, Object> parameters = new HashMap<>();

		return reportService.generatePdfReport(
				"SellerReport",
				da.getSellerReport(),
				parameters,
				"seller-report");
	}

	@GetMapping(value = "/reports/customer-order", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getCustomerOrderById(@RequestParam int id) {
		HashMap<String, Object> m = da.getCustomerOrderById(id);
		@SuppressWarnings("unchecked")
		List<HashMap<String, String>> orders = (List<HashMap<String, String>>) m.get("orders");

		Map<String, Object> parameters = new HashMap<>();
		parameters.put("name", m.get("name"));
		parameters.put("email", m.get("email"));
		parameters.put("address", m.get("address"));

		return reportService.generatePdfReport(
				"CustomerOrders",
				orders,
				parameters,
				"customer-order-report");
	}

	@GetMapping(value = "/reports/stock-alert", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getStockAlertReport(@RequestParam int id) {
		Map<String, Object> parameters = new HashMap<>();

		return reportService.generatePdfReport(
				"StockAlert",
				da.getStockAlertReport(id),
				parameters,
				"stock-alert-report");
	}

	@GetMapping(value = "/reports/top-selling", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getTopSellingReport(@RequestParam int id) {
		Map<String, Object> parameters = new HashMap<>();

		return reportService.generatePdfReport(
				"TopSelling",
				da.getTopSellingReport(id),
				parameters,
				"top-selling-report");
	}

	@GetMapping(value = "/reports/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> getInvoiceByOrderId(@RequestParam int id) {
		HashMap<String, Object> m = da.getInvoiceByOrderId(id);
		@SuppressWarnings("unchecked")
		List<HashMap<String, String>> items = (List<HashMap<String, String>>) m.get("items");

		Map<String, Object> parameters = new HashMap<>();
		parameters.put("id", m.get("id"));
		parameters.put("street", m.get("street"));
		parameters.put("city", m.get("city"));
		parameters.put("state", m.get("state"));
		parameters.put("subTotal", m.get("subTotal"));
		parameters.put("gatewayFee", m.get("gatewayFee"));
		parameters.put("shippingCharge", m.get("shippingCharge"));
		parameters.put("discount", m.get("discount"));
		parameters.put("tax", m.get("tax"));
		parameters.put("orderTotal", m.get("orderTotal"));

		return reportService.generatePdfReport(
				"Invoice",
				items,
				parameters,
				"invoice-report");
	}
}
