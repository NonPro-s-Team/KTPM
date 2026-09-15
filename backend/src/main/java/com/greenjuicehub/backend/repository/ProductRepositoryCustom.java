package com.greenjuicehub.backend.repository;

import com.greenjuicehub.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

public interface ProductRepositoryCustom {

    Page<Product> findAllWithPriceSort(
            Specification<Product> specification,
            Pageable pageable,
            Sort.Direction direction);
}
