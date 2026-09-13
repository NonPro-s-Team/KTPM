package com.greenjuicehub.backend.repository;

import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.ProductVariant;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Repository
@Transactional(readOnly = true)
public class ProductRepositoryCustomImpl implements ProductRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Product> findAllWithPriceSort(
            Specification<Product> specification,
            Pageable pageable,
            Sort.Direction direction) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

        CriteriaQuery<Product> dataQuery = criteriaBuilder.createQuery(Product.class);
        Root<Product> product = dataQuery.from(Product.class);
        Join<Product, ProductVariant> priceVariant = product.join("variants", JoinType.INNER);

        List<Predicate> dataPredicates = new ArrayList<>();
        Predicate filters = specification == null
                ? null
                : specification.toPredicate(product, dataQuery, criteriaBuilder);
        if (filters != null) {
            dataPredicates.add(filters);
        }
        dataPredicates.add(criteriaBuilder.isTrue(priceVariant.get("isActive")));

        Expression<BigDecimal> minimumActivePrice = criteriaBuilder.min(priceVariant.get("salePrice"));
        dataQuery.select(product)
                .where(dataPredicates.toArray(Predicate[]::new))
                .groupBy(product)
                .orderBy(
                        direction.isAscending()
                                ? criteriaBuilder.asc(minimumActivePrice)
                                : criteriaBuilder.desc(minimumActivePrice),
                        criteriaBuilder.asc(product.get("id")));

        TypedQuery<Product> typedQuery = entityManager.createQuery(dataQuery);
        if (pageable.isPaged()) {
            typedQuery.setFirstResult(Math.toIntExact(pageable.getOffset()));
            typedQuery.setMaxResults(pageable.getPageSize());
        }
        List<Product> content = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
        Root<Product> countProduct = countQuery.from(Product.class);
        Join<Product, ProductVariant> countVariant = countProduct.join("variants", JoinType.INNER);

        List<Predicate> countPredicates = new ArrayList<>();
        Predicate countFilters = specification == null
                ? null
                : specification.toPredicate(countProduct, countQuery, criteriaBuilder);
        if (countFilters != null) {
            countPredicates.add(countFilters);
        }
        countPredicates.add(criteriaBuilder.isTrue(countVariant.get("isActive")));

        countQuery.select(criteriaBuilder.countDistinct(countProduct))
                .where(countPredicates.toArray(Predicate[]::new));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }
}
