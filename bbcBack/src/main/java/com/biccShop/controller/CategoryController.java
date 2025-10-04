package com.biccShop.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biccShop.dao.CategoryDA;
import com.biccShop.model.Category;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class CategoryController {

	@org.springframework.beans.factory.annotation.Autowired
	CategoryDA da;

	@GetMapping(value = "/category/all")
	public List<Category> getCategories() {
		return da.getCategories();
	}

	@PostMapping(value = "/category")
	public Category create(@RequestBody Category c) {
		return da.create(c);
	}

	@PutMapping(value = "/category")
	public boolean update(@RequestBody Category c) {
		return da.update(c);
	}

	@DeleteMapping(value = "/category")
	public boolean delete(@RequestParam int id) {
		return da.delete(id);
	}
}
