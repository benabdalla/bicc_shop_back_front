package com.biccShop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.biccShop.entity.CollectionPoint;

public interface CollectionPointRepository extends JpaRepository<CollectionPoint, Integer> {

	public List<CollectionPoint> findAllByDistrict(String district);
}
