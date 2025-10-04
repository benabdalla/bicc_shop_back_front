package com.biccShop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biccShop.dao.AdminDA;
import com.biccShop.dto.AuthRequest;
import com.biccShop.dto.AuthResponse;
import com.biccShop.dto.StatusUpdate;
import com.biccShop.model.Customer;
import com.biccShop.model.Order;
import com.biccShop.model.OrderDetails;
import com.biccShop.model.Product;
import com.biccShop.model.Seller;
import com.biccShop.service.AuthService;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class AdminController {
	@PostMapping(value = "/admin/signup")
	public Object signup(@RequestBody com.biccShop.model.Admin a) {
		try {
			com.biccShop.model.Admin created = da.signup(a);
			if (created != null && created.getEmail() != null) {
				return created;
			} else {
				return java.util.Map.of("error", "Signup failed");
			}
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().contains("Duplicate entry")) {
				return java.util.Map.of("error", "Cet email existe déjà");
			}
			return java.util.Map.of("error", "Erreur serveur");
		}
	}

	@Autowired
	AdminDA da;

	@Autowired
	AuthService authService;

	@PostMapping(value = "/admin/login")
	public AuthResponse login(@RequestBody AuthRequest a) {
		return authService.login(a);
	}

	@GetMapping(value = "/admin/products")
	public List<Product> getAllProducts() {
		return da.getAllProducts();
	}

	@PutMapping(value = "/admin/product")
	public Product updateProduct(@RequestBody Product a) {
		return da.updateProduct(a);
	}

	@GetMapping(value = "/admin/sellers")
	public List<Seller> getAllSellers() {
		return da.getAllSellers();
	}

	@PutMapping(value = "/admin/seller")
	public StatusUpdate updateSeller(@RequestBody StatusUpdate a) {
		return da.updateSeller(a);
	}

	@GetMapping(value = "/admin/customers")
	public List<Customer> getAllCustomers() {
		return da.getAllCustomers();
	}

	@PutMapping(value = "/admin/customer")
	public StatusUpdate updateCustomer(@RequestBody StatusUpdate a) {
		return da.updateCustomer(a);
	}

	@GetMapping(value = "/admin/orders")
	public List<Order> getOrders() {
		return da.getOrders();
	}

	@GetMapping(value = "/admin/order")
	public Order getOrder(@RequestParam("orderid") int orderId) {
		return da.getOrder(orderId);
	}

	@PutMapping(value = "/admin/order")
	public boolean updateOrder(@RequestBody OrderDetails p) {
		return da.updateOrder(p);
	}

	@GetMapping(value = "/admin/orders/shipped")
	public List<Order> getShippedOrders() {
		return da.getShippedOrders();
	}

	@GetMapping(value = "/admin/support/emails")
	public List<String> getSupportEmails() {
		// Example: Returns a list of support emails
		return List.of("support1@example.com", "support2@example.com");
	}
}
