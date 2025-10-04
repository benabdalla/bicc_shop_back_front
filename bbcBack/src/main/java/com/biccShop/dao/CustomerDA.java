
package com.biccShop.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.biccShop.db;
import com.biccShop.model.CartItem;
import com.biccShop.model.Customer;
import com.biccShop.model.Order;
import com.biccShop.model.OrderDetails;
import com.biccShop.model.Product;
import com.biccShop.model.Role;
import com.biccShop.service.EmailService;

@Service
public class CustomerDA {
	@org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
	private String appEmail;
	public boolean contactUs(String nom, String email, String sujet, String message) {
		try {
			String body = "<h2>Contact client</h2>"
				+ "<p><b>Nom :</b> " + nom + "</p>"
				+ "<p><b>Email :</b> " + email + "</p>"
				+ "<p><b>Sujet :</b> " + sujet + "</p>"
				+ "<p><b>Message :</b><br>" + message + "</p>";
			mailer.sendContentEmail(appEmail, "Contact client : " + sujet, body);
			return true;
		} catch (Exception e) {
			System.out.println(e);
		}
		return false;
	}
	public List<Product> searchProducts(String q) {
		List<Product> list = new ArrayList<>();
		try {
			pst = db.get().prepareStatement(
				"SELECT product_id, title, thumbnail_url, description, regular_price, sale_price, category, stock_status, stock_count, products.status "
				+ "FROM products JOIN sellers USING(seller_id) "
				+ "WHERE products.status = 'Active' AND sellers.status = 'Active' AND title LIKE ?");
			pst.setString(1, "%".concat(q).concat("%"));
			ResultSet rs = pst.executeQuery();
			Product p;
			while (rs.next()) {
				p = new Product();
				p.setId(rs.getInt(1));
				p.setTitle(rs.getString(2));
				p.setThumbnailUrl(rs.getString(3));
				p.setDescription(rs.getString(4));
				p.setRegularPrice(rs.getString(5));
				p.setSalePrice(rs.getString(6));
				p.setCategory(rs.getString(7));
				p.setStockStatus(rs.getString(8));
				p.setStockCount(rs.getString(9));
				p.setStatus(rs.getString(10));
				list.add(p);
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return list;
	}

	public List<Order> getOrders(int customerId) {
		List<Order> orders = new ArrayList<>();
		try {
			pst = db.get().prepareStatement("SELECT * FROM orders WHERE customer_id = ?");
			pst.setInt(1, customerId);
			ResultSet rs = pst.executeQuery();
			while (rs.next()) {
				Order o = new Order();
				o.setId(rs.getInt("id"));
				o.setOrderDate(rs.getDate("order_date"));
				o.setOrderTotal(rs.getDouble("order_total"));
				o.setCustomerId(rs.getInt("customer_id"));
				o.setStatus(rs.getString("status"));
				orders.add(o);
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return orders;
	}

	public Order getOrder(int id) {
		Order o = null;
		try {
			pst = db.get().prepareStatement("SELECT * FROM orders WHERE order_id = ?");
			pst.setInt(1, id);
			ResultSet rs = pst.executeQuery();
			if (rs.next()) {
				o = new Order();
				o.setId(rs.getInt("order_id"));
				o.setOrderDate(rs.getDate("order_date"));
				o.setOrderTotal(rs.getDouble("order_total"));
				o.setCustomerId(rs.getInt("customer_id"));
				o.setStatus(rs.getString("status"));
				o.setDiscount(rs.getDouble("discount"));
				o.setShippingCharge(rs.getDouble("shipping_charge"));
				o.setTax(rs.getDouble("tax"));
				o.setShippingStreet(rs.getString("shipping_street"));
				o.setShippingCity(rs.getString("shipping_city"));
				o.setShippingPostCode(rs.getString("shipping_post_code"));
				o.setShippingState(rs.getString("shipping_state"));
				o.setShippingCountry(rs.getString("shipping_country"));
				o.setSubTotal(rs.getDouble("sub_total"));
				o.setPaymentStatus(rs.getString("payment_status"));
				o.setPaymentMethod(rs.getString("payment_method"));
				o.setCardNumber(rs.getString("card_number"));
				o.setCardCvv(rs.getString("card_cvv"));
				o.setCardHolderName(rs.getString("card_holder_name"));
				o.setCardExpiryDate(rs.getString("card_expiry_date"));
				o.setGatewayFee(rs.getDouble("gateway_fee"));

				// Récupérer les détails de la commande
				PreparedStatement pst2 = db.get().prepareStatement("SELECT * FROM order_details WHERE order_id = ?");
				pst2.setInt(1, id);
				ResultSet rs2 = pst2.executeQuery();
				List<OrderDetails> details = new ArrayList<>();
				while (rs2.next()) {
					OrderDetails od = new OrderDetails();
					od.setOrderDetailsId(rs2.getInt("order_details_id"));
					od.setOrderId(rs2.getInt("order_id"));
					od.setProductId(rs2.getInt("product_id"));
					od.setSellerId(rs2.getInt("seller_id"));
					od.setProductName(rs2.getString("product_name"));
					od.setProductUnitPrice(rs2.getDouble("product_unit_price"));
					od.setProductThumbnailUrl(rs2.getString("product_thumbnail_url"));
					od.setStatus(rs2.getString("status"));
					od.setQuantity(rs2.getInt("quantity"));
					od.setSubTotal(rs2.getDouble("sub_total"));
					od.setDeliveryDate(rs2.getDate("delivery_date"));
					details.add(od);
				}
				o.setOrderDetails(details);
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return o;
	}

	public OrderDetails trackOrder(int id) {
		OrderDetails od = null;
		try {
			pst = db.get().prepareStatement("SELECT * FROM order_details WHERE order_details_id = ?");
			pst.setInt(1, id);
			ResultSet rs = pst.executeQuery();
			if (rs.next()) {
				od = new OrderDetails();
				od.setOrderDetailsId(rs.getInt("order_details_id"));
				od.setOrderId(rs.getInt("order_id"));
				od.setProductId(rs.getInt("product_id"));
				od.setSellerId(rs.getInt("seller_id"));
				od.setProductName(rs.getString("product_name"));
				od.setQuantity(rs.getInt("quantity"));
				od.setSubTotal(rs.getDouble("sub_total"));
				od.setStatus(rs.getString("status"));
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return od;
	}

	public boolean isProductPurchased(int customerId, int productId) {
		try {
			pst = db.get().prepareStatement("SELECT COUNT(*) FROM orders o JOIN order_details od ON o.id = od.order_id WHERE o.customer_id = ? AND od.product_id = ?");
			pst.setInt(1, customerId);
			pst.setInt(2, productId);
			ResultSet rs = pst.executeQuery();
			if (rs.next() && rs.getInt(1) > 0) {
				return true;
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return false;
	}
	PreparedStatement pst;

	@Autowired
	EmailService mailer;

	public Customer findByEmail(String email) throws UsernameNotFoundException {
		Customer customer = null;
		try {
			pst = db.get().prepareStatement(
					"SELECT customer_id, name, email, role, address, password FROM customers WHERE email = ? AND status = 'Active'");
			pst.setString(1, email);
			ResultSet rs = pst.executeQuery();
			if (rs.next()) {
				customer = new Customer();
				customer.setId(rs.getInt(1));
				customer.setName(rs.getString(2));
				customer.setEmail(rs.getString(3));
				customer.setRole(Role.valueOf(rs.getString(4)));
				customer.setAddress(rs.getString(5));
				customer.setPassword(rs.getString(6));
			} else {
				throw new UsernameNotFoundException("User not found");
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return customer;
	}
	
	public Customer login(Customer a) {
		Customer customer = null;
		try {
			pst = db.get().prepareStatement(
					"SELECT customer_id, name, email, role, address FROM customers WHERE email = ? AND password = ? AND status = 'Active'");
			pst.setString(1, a.getEmail());
			pst.setString(2, a.getPassword());
			ResultSet rs = pst.executeQuery();
			if (rs.next()) {
				customer = new Customer();
				customer.setId(rs.getInt(1));
				customer.setName(rs.getString(2));
				customer.setEmail(rs.getString(3));
				customer.setRole(Role.valueOf(rs.getString(4)));
				customer.setAddress(rs.getString(5));
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return customer;
	}

	@Autowired
	private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

	public Customer signup(Customer a) {
		try {
			String hashedPassword = passwordEncoder.encode(a.getPassword());
			pst = db.get().prepareStatement(
					"INSERT INTO customers (name, email, password, role, address) VALUES (?, ?, ?, ?, ?)");
			pst.setString(1, a.getName());
			pst.setString(2, a.getEmail());
			pst.setString(3, hashedPassword);
			pst.setString(4, a.getRole().name());
			pst.setString(5, a.getAddress());
			int x = pst.executeUpdate();
			if (x != -1) {
				a.setPassword(null);
				// Envoi du mail de bienvenue
				String subject = "Bienvenue sur BICC";
				String body = "<h1>Inscription réussie !</h1>"
					+ "<p>Bonjour " + a.getName() + ",</p>"
					+ "<p>Votre inscription sur le site e-commerce BICC a été réalisée avec succès.</p>"
					+ "<p>Voici vos informations :</p>"
					+ "<ul>"
					+ "<li>Nom : " + a.getName() + "</li>"
					+ "<li>Email : " + a.getEmail() + "</li>"
					+ "<li>Adresse : " + a.getAddress() + "</li>"
					+ "<li>Rôle : Client "  + "</li>"
					+ "</ul>"
					+ "<p>Merci de votre confiance !</p>";
				mailer.sendContentEmail(a.getEmail(), subject, body);
				return a;
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return a;
	}

	public Customer getCustomer(int customerId) {
		Customer p = null;
		try {
			pst = db.get().prepareStatement(
					"SELECT customer_id, name, email, password, role, address, status, email_verified FROM customers WHERE customer_id = ?");
			pst.setInt(1, customerId);
			ResultSet rs = pst.executeQuery();
			while (rs.next()) {
				p = new Customer();
				p.setId(rs.getInt(1));
				p.setName(rs.getString(2));
				p.setEmail(rs.getString(3));
				p.setPassword(null);
				p.setRole(Role.valueOf(rs.getString(5)));
				p.setAddress(rs.getString(6));
				p.setStatus(rs.getString(7));
				p.setEmailVerified(rs.getBoolean(8));
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return p;
	}

	public Product getProduct(int productId) {
		Product p = null;
		try {
			pst = db.get().prepareStatement(
					"SELECT product_id, title, thumbnail_url, description, regular_price, sale_price, category, stock_status, stock_count, seller_id, store_name, products.status FROM products JOIN sellers USING(seller_id) WHERE product_id = ?");
			pst.setInt(1, productId);
			ResultSet rs = pst.executeQuery();
			while (rs.next()) {
				p = new Product();
				p.setId(rs.getInt(1));
				p.setTitle(rs.getString(2));
				p.setThumbnailUrl(rs.getString(3));
				p.setDescription(rs.getString(4));
				p.setRegularPrice(rs.getString(5));
				p.setSalePrice(rs.getString(6));
				p.setCategory(rs.getString(7));
				p.setStockStatus(rs.getString(8));
				p.setStockCount(rs.getString(9));
				p.setSellerId(rs.getInt(10));
				p.setStoreName(rs.getString(11));
				p.setStatus(rs.getString(12));
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return p;
	}

	public List<Product> getProducts() {
		List<Product> list = new ArrayList<>();
		try {
			pst = db.get().prepareStatement(
					"SELECT product_id, title, thumbnail_url, description, regular_price, sale_price, category, stock_status, stock_count, products.status, seller_id, store_name "
							+ "FROM products JOIN sellers USING(seller_id)"
							+ "WHERE products.status = 'Active' AND sellers.status = 'Active'");
			ResultSet rs = pst.executeQuery();
			Product p;
			while (rs.next()) {
				p = new Product();
				p.setId(rs.getInt(1));
				p.setTitle(rs.getString(2));
				p.setThumbnailUrl(rs.getString(3));
				p.setDescription(rs.getString(4));
				p.setRegularPrice(rs.getString(5));
				p.setSalePrice(rs.getString(6));
				p.setCategory(rs.getString(7));
				p.setStockStatus(rs.getString(8));
				p.setStockCount(rs.getString(9));
				p.setStatus(rs.getString(10));
				p.setSellerId(rs.getInt(11));
				p.setStoreName(rs.getString(12));
				list.add(p);
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return list;
	}

	public CartItem addToCart(CartItem a) {
		try {
			pst = db.get().prepareStatement(
					"INSERT INTO carts (customer_id, product_id, seller_id, store_name, product_name, product_thumbnail_url, product_unit_price, quantity, sub_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
			pst.setInt(1, a.getCustomerId());
			pst.setInt(2, a.getProductId());
			pst.setInt(3, a.getSellerId());
			pst.setString(4, a.getStoreName());
			pst.setString(5, a.getProductName());
			pst.setString(6, a.getProductThumbnailUrl());
			pst.setDouble(7, a.getProductUnitPrice());
			pst.setInt(8, a.getProductQuantity());
			pst.setDouble(9, a.getSubTotal());
			int x = pst.executeUpdate();
			if (x != -1) {
				return a;
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return null;
	}

	public boolean updateCart(CartItem a) {
		try {
			pst = db.get().prepareStatement("UPDATE carts SET quantity = ?, sub_total = ? WHERE cart_id = ?");
			pst.setInt(1, a.getProductQuantity());
			pst.setDouble(2, a.getSubTotal());
			pst.setInt(3, a.getId());
			int x = pst.executeUpdate();
			if (x != -1) {
				return true;
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return false;
	}

	public boolean removeFromCart(int id) {
		try {
			pst = db.get().prepareStatement("DELETE FROM carts WHERE cart_id = ?");
			pst.setInt(1, id);
			int x = pst.executeUpdate();
			if (x != -1) {
				return true;
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return false;
	}

	public List<CartItem> getCartItems(int customerId) {
		List<CartItem> list = new ArrayList<>();
		try {
			pst = db.get().prepareStatement(
					"SELECT cart_id, customer_id, product_id, seller_id, store_name, product_name, product_thumbnail_url, product_unit_price, quantity, sub_total FROM carts WHERE customer_id = ?");
			pst.setInt(1, customerId);
			ResultSet rs = pst.executeQuery();
			CartItem p;
			while (rs.next()) {
				p = new CartItem();
				p.setId(rs.getInt(1));
				p.setCustomerId(rs.getInt(2));
				p.setProductId(rs.getInt(3));
				p.setSellerId(rs.getInt(4));
				p.setStoreName(rs.getString(5));
				p.setProductName(rs.getString(6));
				p.setProductThumbnailUrl(rs.getString(7));
				p.setProductUnitPrice(rs.getDouble(8));
				p.setProductQuantity(rs.getInt(9));
				p.setSubTotal(rs.getDouble(10));
				list.add(p);
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return list;
	}

	public Order placeOrder(Order a) {
		try {
			pst = db.get().prepareStatement(
					"INSERT INTO orders (order_date, order_total, customer_id, discount, shipping_charge, tax, shipping_street, shipping_city, shipping_post_code, shipping_state, shipping_country, status, sub_total, payment_status, payment_method, card_number, card_cvv, card_holder_name, card_expiry_date, gateway_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
					Statement.RETURN_GENERATED_KEYS);
			pst.setDate(1, a.getOrderDate());
//			pst.setDate(1, new Date(System.currentTimeMillis()));
			pst.setDouble(2, a.getOrderTotal());
			pst.setInt(3, a.getCustomerId());
			pst.setDouble(4, a.getDiscount());
			pst.setDouble(5, a.getShippingCharge());
			pst.setDouble(6, a.getTax());
			pst.setString(7, a.getShippingStreet());
			pst.setString(8, a.getShippingCity());
			pst.setString(9, a.getShippingPostCode());
			pst.setString(10, a.getShippingState());
			pst.setString(11, a.getShippingCountry());
			pst.setString(12, a.getStatus());
			pst.setDouble(13, a.getSubTotal());
			pst.setString(14, a.getPaymentStatus());
			pst.setString(15, a.getPaymentMethod());
			pst.setString(16, a.getCardNumber());
			pst.setString(17, a.getCardCvv());
			pst.setString(18, a.getCardHolderName());
			pst.setString(19, a.getCardExpiryDate());
			pst.setDouble(20, a.getGatewayFee());
			int x = pst.executeUpdate();
			if (x != -1) {
				ResultSet generatedKeys = pst.getGeneratedKeys();
				int generatedId = 0;
				if (generatedKeys.next()) {
					generatedId = generatedKeys.getInt(1);
					a.setId(generatedId);
				}

				List<OrderDetails> orderDetails = a.getOrderDetails();
				PreparedStatement pst2 = db.get().prepareStatement(
						"INSERT INTO order_details (order_id, product_id, seller_id, store_name, product_name, product_unit_price, product_thumbnail_url, status, quantity, sub_total, delivery_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
				   StringBuilder orderDetailString = new StringBuilder();
				   for (OrderDetails o : orderDetails) {
					   pst2.setInt(1, generatedId);
					   pst2.setInt(2, o.getProductId());
					   pst2.setInt(3, o.getSellerId());
					   pst2.setString(4, o.getStoreName());
					   pst2.setString(5, o.getProductName());
					   pst2.setDouble(6, o.getProductUnitPrice());
					   pst2.setString(7, o.getProductThumbnailUrl());
					   pst2.setString(8, o.getStatus());
					   pst2.setInt(9, o.getQuantity());
					   pst2.setDouble(10, o.getSubTotal());
					   pst2.setDate(11, o.getDeliveryDate());
					   pst2.addBatch();

					   // Construire le tableau HTML
					   orderDetailString.append("<tr>");
					   orderDetailString.append("<td>").append(o.getProductName()).append("</td>");
					   orderDetailString.append("<td>").append(o.getQuantity()).append("</td>");
					   orderDetailString.append("<td>").append(o.getSubTotal()).append("</td>");
					   orderDetailString.append("</tr>");
				   }
				   pst2.executeBatch();

				   // Email de confirmation au client (après l'insertion des détails)
				   mailer.sendContentEmail(
					   getCustomer(a.getCustomerId()).getEmail(),
					   "Commande passée avec succès",
					   String.format(
						   "<html><head><style>.header{width:400px;background-color:#04AA6D;color:white;padding:10px 20px;}table{border-collapse:collapse;width:400px;}td,th{border:1px solid #ddd;padding:8px;}th{padding-top:12px;padding-bottom:12px;text-align:left;background-color:#04AA6D;color:white;}</style></head><body><h1 class='header'>Commande passée avec succès</h1><p>Votre commande a été enregistrée. Voici le détail :</p><table><tr><th>Produit</th><th>Quantité</th><th>Prix</th></tr>%s</table></body></html>",
						   orderDetailString.toString()
					   )
				   );
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return a;
	}

	public boolean sendVerificationCode(Customer a) {
		try {
			Random random = new Random();
			int randomCode = random.nextInt(999999 - 100000 + 1) + 100000;

			pst = db.get().prepareStatement("DELETE FROM verification_code WHERE user_id = ?");
			pst.setInt(1, a.getId());
			pst.executeUpdate();

			pst = db.get().prepareStatement("INSERT INTO verification_code (user_id, code) VALUES (?, ?)");
			pst.setInt(1, a.getId());
			pst.setInt(2, randomCode);
			pst.executeUpdate();

			mailer.sendContentEmail("humahfuj@gmail.com", "Verification Code",
					"<h2>Verification code is : " + String.valueOf(randomCode) + "</h2>");

			return true;
		} catch (Exception e) {
			System.out.println(e);
		}
		return false;
	}

	public boolean verifyCode(int userId, int code) {
		try {
			pst = db.get().prepareStatement("SELECT * FROM verification_code WHERE user_id = ? AND code = ?");
			pst.setInt(1, userId);
			pst.setInt(2, code);
			ResultSet rs = pst.executeQuery();
			if (rs.next()) {
				mailer.sendContentEmail("humahfuj@gmail.com", "Email Verified",
						"<h2>Email verification is complete</h2>");

				pst = db.get().prepareStatement("DELETE FROM verification_code WHERE user_id = ?");
				pst.setInt(1, userId);
				pst.executeUpdate();

				pst = db.get().prepareStatement("UPDATE customers SET email_verified = true WHERE customer_id = ?");
				pst.setInt(1, userId);
				pst.executeUpdate();
				return true;
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return false;
	}


    public boolean existsByEmail(String email) {
        if (email == null) return false;
        String normalized = email.trim().toLowerCase();
        final String sql = "SELECT 1 FROM customers WHERE email = ?";
        try (PreparedStatement ps = db.get().prepareStatement(sql)) {
            ps.setString(1, normalized);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.out.println("existsByEmail error: " + e.getMessage());
        }
        return false;
    }

}
