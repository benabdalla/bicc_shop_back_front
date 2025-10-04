package com.biccShop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biccShop.dao.SellerDA;
import com.biccShop.dto.AuthRequest;
import com.biccShop.dto.AuthResponse;
import com.biccShop.model.Order;
import com.biccShop.model.OrderDetails;
import com.biccShop.model.Product;
import com.biccShop.model.Seller;
import com.biccShop.service.AuthService;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class SellerController {

	@Autowired
	SellerDA da;

	@Autowired
	AuthService authService;
	
	@PostMapping(value = "/seller/login")
	public AuthResponse login(@RequestBody AuthRequest a) {
		return authService.sellerLogin(a);
	}
	
	@PostMapping(value = "/seller/signup")
	public Seller signup(@RequestBody Seller a) {
        if(da.existsByEmail(a.getEmail())){
            return null;
        }else{
            return da.signup(a);
        }
	}

    @GetMapping("/seller/check-email")
    public boolean sellerEmailExists(@RequestParam("email") String email) {
        return da.existsByEmail(email == null ? null : email.trim().toLowerCase());
    }

	
	@GetMapping(value = "/seller/{sellerId}")
	public Seller getSeller(@PathVariable("sellerId") int sellerId) {
		return da.getSeller(sellerId);
	}
	
	@GetMapping(value = "/seller/product/{productId}")
	public Product getProduct(@PathVariable("productId") int productId) {
		return da.getProduct(productId);
	}
	
	@GetMapping(value = "/seller/products/{sellerId}")
	public List<Product> getProducts(@PathVariable("sellerId") int sellerId) {
		return da.getProducts(sellerId);
	}
	
	@PostMapping(value = "/seller/product")
	public Product addProduct(@RequestBody Product p) {
		return da.createProduct(p);
	}
	
	@PutMapping(value = "/seller/product")
	public boolean updateProduct(@RequestBody Product p) {
		return da.updateProduct(p);
	}

	@DeleteMapping(value = "/seller/product/{id}")
	public boolean deleteProduct(@PathVariable("id") int id) {
		return da.deleteProduct(id);
	}
	
	@GetMapping(value = "/seller/orders")
	public List<Order> getOrders(@RequestParam int id) {
		return da.getOrders(id);
	}

	@GetMapping(value = "/seller/order")
	public Order getOrder(@RequestParam("orderid") int orderId, @RequestParam("sellerid") int sellerId) {
		return da.getOrder(orderId, sellerId);
	}
	
	@PutMapping(value = "/seller/order")
	public boolean updateOrder(@RequestBody OrderDetails p) {
		return da.updateOrder(p);
	}
}
