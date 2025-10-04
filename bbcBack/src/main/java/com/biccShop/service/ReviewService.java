package com.biccShop.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.biccShop.entity.Review;
import com.biccShop.repository.ReviewRepository;

@Service
public class ReviewService {

	@Autowired
	ReviewRepository rr;

	public boolean addReview(Review r) {
		rr.save(r);
		return true;
	}

	public List<Review> findAllByProductId(int productId) {
		return rr.findAllByProductId(productId);
	}
}
