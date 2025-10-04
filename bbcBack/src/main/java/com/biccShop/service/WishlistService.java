package com.biccShop.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.biccShop.dao.WishlistDA;
import com.biccShop.dto.WishlistDetail;
import com.biccShop.entity.Wishlist;
import com.biccShop.repository.WishlistRepository;

@Service
public class WishlistService {

	@Autowired
	WishlistRepository wr;
	
	@Autowired
	WishlistDA da;

	public boolean addToWishlist(Wishlist wishlist) {
		wr.save(wishlist);
		return true;
	}

	public boolean removeFromWishlist(Wishlist wishlist) {
		wr.deleteByCustomerIdAndProductId(wishlist.getCustomerId(), wishlist.getProductId());
		return true;
	}

	public boolean isWishlisted(Wishlist wishlist) {
		return wr.existsByCustomerIdAndProductId(wishlist.getCustomerId(), wishlist.getProductId());
	}

	public List<WishlistDetail> findAllByCustomerId(int customerId) {
		return da.findAllByCustomerId(customerId);
	}
}
