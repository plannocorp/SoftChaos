package com.softchaos.repository;

import com.softchaos.enums.CommentStatus;
import com.softchaos.model.Article;
import com.softchaos.model.Comment;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CommentRepositoryImpl implements CommentRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Comment> findAdminComments(
            CommentStatus status,
            String articleQuery,
            LocalDateTime createdFrom,
            LocalDateTime createdUntil,
            Pageable pageable
    ) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Comment> dataQuery = cb.createQuery(Comment.class);
        Root<Comment> dataRoot = dataQuery.from(Comment.class);
        dataRoot.fetch("article", JoinType.INNER);
        Join<Comment, Article> dataArticleJoin = dataRoot.join("article", JoinType.INNER);

        List<Predicate> predicates = buildPredicates(cb, dataRoot, dataArticleJoin, status, articleQuery, createdFrom, createdUntil);
        dataQuery.select(dataRoot).distinct(true);
        dataQuery.where(predicates.toArray(Predicate[]::new));
        dataQuery.orderBy(resolveOrders(cb, dataRoot, dataArticleJoin, pageable.getSort()));

        TypedQuery<Comment> typedDataQuery = entityManager.createQuery(dataQuery);
        typedDataQuery.setFirstResult((int) pageable.getOffset());
        typedDataQuery.setMaxResults(pageable.getPageSize());

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Comment> countRoot = countQuery.from(Comment.class);
        Join<Comment, Article> countArticleJoin = countRoot.join("article", JoinType.INNER);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, countArticleJoin, status, articleQuery, createdFrom, createdUntil);
        countQuery.select(cb.countDistinct(countRoot));
        countQuery.where(countPredicates.toArray(Predicate[]::new));

        List<Comment> content = typedDataQuery.getResultList();
        long total = entityManager.createQuery(countQuery).getSingleResult();
        return new PageImpl<>(content, pageable, total);
    }

    private List<Predicate> buildPredicates(
            CriteriaBuilder cb,
            Root<Comment> root,
            Join<Comment, Article> articleJoin,
            CommentStatus status,
            String articleQuery,
            LocalDateTime createdFrom,
            LocalDateTime createdUntil
    ) {
        List<Predicate> predicates = new ArrayList<>();

        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }

        if (articleQuery != null && !articleQuery.isBlank()) {
            String pattern = "%" + articleQuery.toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(articleJoin.get("title")), pattern),
                    cb.like(cb.lower(articleJoin.get("slug")), pattern)
            ));
        }

        if (createdFrom != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
        }

        if (createdUntil != null) {
            predicates.add(cb.lessThan(root.get("createdAt"), createdUntil));
        }

        return predicates;
    }

    private List<Order> resolveOrders(
            CriteriaBuilder cb,
            Root<Comment> root,
            Join<Comment, Article> articleJoin,
            Sort sort
    ) {
        List<Order> orders = new ArrayList<>();

        if (sort.isSorted()) {
            for (Sort.Order sortOrder : sort) {
                var path = switch (sortOrder.getProperty()) {
                    case "article.title" -> articleJoin.get("title");
                    case "article.slug" -> articleJoin.get("slug");
                    default -> root.get(sortOrder.getProperty());
                };

                orders.add(sortOrder.isAscending() ? cb.asc(path) : cb.desc(path));
            }
        }

        if (orders.isEmpty()) {
            orders.add(cb.desc(root.get("createdAt")));
        }

        return orders;
    }
}
