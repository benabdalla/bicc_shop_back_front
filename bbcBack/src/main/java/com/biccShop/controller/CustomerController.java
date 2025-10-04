package com.biccShop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biccShop.dao.CustomerDA;
import com.biccShop.dto.AuthRequest;
import com.biccShop.dto.AuthResponse;
import com.biccShop.model.CartItem;
import com.biccShop.model.Customer;
import com.biccShop.model.Order;
import com.biccShop.model.OrderDetails;
import com.biccShop.model.Product;
import com.biccShop.service.AuthService;

@CrossOrigin(origins = "*")
@RestController
public class CustomerController {
	@PostMapping(value = "/customer/contact")
	public boolean contactUs(@RequestParam String nom, @RequestParam String email, @RequestParam String sujet, @RequestParam String message) {
		return da.contactUs(nom, email, sujet, message);
	}



	@Autowired
	CustomerDA da;
	
	@Autowired
	AuthService authService;

	@PostMapping(value = "/customer/login")
	public AuthResponse login(@RequestBody AuthRequest a) {
		return authService.customerLogin(a);
	}

	@PostMapping(value = "/customer/signup")
	public Customer signup(@RequestBody Customer a) {
        if(da.existsByEmail(a.getEmail())){
            return null;
        }else{
            return da.signup(a);
        }
	}

	@GetMapping(value = "/customer/{customerId}")
	public Customer getCustomer(@PathVariable int customerId) {
		return da.getCustomer(customerId);
	}

	@GetMapping(value = "/product/{productId}")
	public Product getProduct(@PathVariable("productId") int productId) {
		return da.getProduct(productId);
	}

	@GetMapping(value = "/products")
	public List<Product> getProducts() {
		return da.getProducts();
	}

	@PostMapping(value = "/customer/cart")
	public CartItem addToCart(@RequestBody CartItem a) {
		return da.addToCart(a);
	}

	@PutMapping(value = "/customer/cart")
	public boolean updateCart(@RequestBody CartItem a) {
		return da.updateCart(a);
	}

	@DeleteMapping(value = "/customer/cart")
	public boolean removeFromCart(@RequestParam int id) {
		return da.removeFromCart(id);
	}

	@GetMapping(value = "/customer/cart")
	public List<CartItem> getCartItems(@RequestParam int id) {
		return da.getCartItems(id);
	}

	@PostMapping(value = "/customer/order")
	public Order placeOrder(@RequestBody Order a) {
		return da.placeOrder(a);
	}

	@GetMapping(value = "/customer/orders")
	public List<Order> getOrders(@RequestParam int id) {
		return da.getOrders(id);
	}

	@GetMapping(value = "/customer/order")
	public Order getOrderById(@RequestParam int id) {
		return da.getOrder(id);
	}

	@GetMapping(value = "/customer/track")
	public OrderDetails trackOrder(@RequestParam int id) {
		return da.trackOrder(id);
	}

	@GetMapping(value = "/customer/check-purchased")
	public boolean isProductPurchased(@RequestParam int customerId, @RequestParam int productId) {
		return da.isProductPurchased(customerId, productId);
	}

	@GetMapping(value = "/search")
	public List<Product> searchProducts(@RequestParam String q) {
		return da.searchProducts(q);
	}

	@PostMapping(value = "/customer/send-code")
	public boolean sendVerificationCode(@RequestBody Customer a) {
		return da.sendVerificationCode(a);
	}

	@GetMapping(value = "/customer/verify-code")
	public boolean verifyCode(@RequestParam int userId, @RequestParam int code) {
		return da.verifyCode(userId, code);
	}


    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        // Validate email format server-side as well
        if (!isValidEmailFormat(email)) {
            return ResponseEntity.badRequest().body(true); // Invalid format = "exists" to prevent use
        }

        boolean exists = da.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    private boolean isValidEmailFormat(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }

}
