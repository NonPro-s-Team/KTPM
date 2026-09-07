package com.greenjuicehub.backend.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenjuicehub.backend.entity.*;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.shipping.GhnService;
import com.greenjuicehub.backend.utils.JwtUtil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Explicit opt-in: mvnw -Dtest=CheckoutBrowserIT test. Never packaged in production. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "server.address=127.0.0.1",
        "spring.datasource.url=jdbc:h2:mem:checkout_browser;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE;NON_KEYWORDS=VALUE",
        "jwt.secret=checkout-browser-local-only-signing-secret-at-least-32-bytes",
        "app.sepay.api-key=checkout-local-sepay-key",
        "vnpay.tmn-code=CHECKOUTTEST",
        "vnpay.hash-secret=checkout-local-vnpay-key",
        "vnpay.pay-url=http://127.0.0.1:4173/__vnpay_simulator",
        "vnpay.return-url=http://127.0.0.1:4173/payment/vnpay/result"
})
@ActiveProfiles("test")
class CheckoutBrowserIT {
    @LocalServerPort private int port;
    @Autowired private EntityManager em;
    @Autowired private TransactionTemplate transaction;
    @Autowired private JwtUtil jwt;
    @MockitoBean private TokenBlacklistService blacklist;
    @MockitoBean private GhnService ghn;
    @MockitoBean(name = "corsConfigurationSource") private CorsConfigurationSource cors;

    @Test
    void checkoutJourneysAgainstRealBackend() throws Exception {
        CorsConfiguration local = new CorsConfiguration();
        local.setAllowedOrigins(List.of("http://127.0.0.1:4173"));
        local.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        local.setAllowedHeaders(List.of("*"));
        local.setAllowCredentials(true);
        when(cors.getCorsConfiguration(any())).thenReturn(local);
        // Deliberately different from the outside-HCM fixed fee: catches accidental GHN calls.
        when(ghn.calculateShippingFee(anyInt(), anyString(), anyInt())).thenReturn(new BigDecimal("19000"));
        Map<String, Object> fixtures = transaction.execute(status -> seed());
        Path root = Path.of("..").toAbsolutePath().normalize();
        Path output = root.resolve("e2e/output/checkout-journey");
        Files.createDirectories(output);
        Path console = output.resolve("runner.log");
        String node = System.getProperty("e2e.node", "node");
        ProcessBuilder builder = new ProcessBuilder(node, "scripts/run-tests.js", "journey")
                .directory(root.resolve("e2e").toFile()).redirectErrorStream(true).redirectOutput(console.toFile());
        builder.environment().remove("E2E_BASE_URL");
        builder.environment().put("E2E_API_URL", "http://127.0.0.1:" + port + "/api");
        builder.environment().put("E2E_CHECKOUT_FIXTURES", new ObjectMapper().writeValueAsString(fixtures));
        builder.environment().put("E2E_SEPAY_KEY", "checkout-local-sepay-key");
        builder.environment().put("E2E_VNPAY_KEY", "checkout-local-vnpay-key");
        Process process = builder.start();
        try {
            assertTrue(process.waitFor(5, TimeUnit.MINUTES), "CodeceptJS exceeded five minutes");
            System.out.print(Files.readString(console));
            assertEquals(0, process.exitValue(), "See e2e/output/checkout-journey for failures");
            // Only HCM control scenario may invoke GHN (quote + order placement).
            verify(ghn, atLeastOnce()).calculateShippingFee(eq(1454), eq("20101"), anyInt());
            verify(ghn, never()).calculateShippingFee(eq(1485), anyString(), anyInt());
            transaction.executeWithoutResult(status -> {
                assertEquals(6L, em.createQuery("select count(o) from Order o", Long.class).getSingleResult());
                assertEquals(4L, em.createQuery("select count(o) from Order o where o.status = :status", Long.class)
                        .setParameter("status", Order.OrderStatus.DELIVERED).getSingleResult());
                assertEquals(4L, em.createQuery("select count(p) from Payment p where p.status = :status", Long.class)
                        .setParameter("status", Payment.PaymentStatus.SUCCESS).getSingleResult());
                assertEquals(1L, em.createQuery("select count(p) from Payment p where p.status = :status", Long.class)
                        .setParameter("status", Payment.PaymentStatus.FAILED).getSingleResult());
                assertEquals(88, em.createQuery("select v.stockQty from ProductVariant v", Integer.class).getSingleResult());
            });
        } finally {
            if (process.isAlive()) {
                process.descendants().forEach(ProcessHandle::destroyForcibly);
                process.destroyForcibly();
            }
        }
    }

    private Map<String, Object> seed() {
        // H2 JSON wraps JDBC setString values in JSON quotes; MySQL stores the JSON object.
        // Keep the existing String mapping for this browser fixture. JSON-column semantics
        // still require a MySQL integration test; production schema is never altered here.
        em.createNativeQuery("alter table orders alter column shipping_address varchar(10000)").executeUpdate();
        Category category = Category.builder().name("E2E Juice").slug("e2e-juice")
                .sortOrder(0).isActive(true).build();
        em.persist(category);
        Product product = Product.builder().category(category).name("Nước ép kiểm thử")
                .slug("checkout-test-juice").avgRating(0f).reviewCount(0).isDeleted(false).isActive(true).build();
        em.persist(product);
        ProductVariant variant = ProductVariant.builder().product(product).originalPrice(new BigDecimal("50000"))
                .salePrice(new BigDecimal("50000")).discountPercent(BigDecimal.ZERO).stockQty(100)
                .isActive(true).sortOrder(0).weightGram(500).build();
        em.persist(variant);
        Map<String, Object> result = new LinkedHashMap<>();
        for (String key : List.of("COD", "VNPAY", "MOMO", "BANK_TRANSFER", "VNPAY_DECLINED", "HCM")) {
            User user = newUser("E2E " + key, User.Role.CUSTOMER);
            boolean hcm = key.equals("HCM");
            Address address = Address.builder().user(user).fullName("Khách kiểm thử " + key).phone("0900000000")
                    .province(hcm ? "Hồ Chí Minh" : "Hà Nội").district(hcm ? "Quận 1" : "Ba Đình")
                    .ward("Phường kiểm thử").detail("Địa chỉ giả lập, không giao hàng")
                    .districtId(hcm ? 1454 : 1485).wardCode(hcm ? "20101" : "10001").isDefault(true).build();
            em.persist(address);
            Cart cart = Cart.builder().user(user).build();
            em.persist(cart);
            CartItem item = CartItem.builder().cart(cart).product(product).variant(variant).quantity(2).build();
            em.persist(item);
            result.put(key, Map.of("token", jwt.generateAccessToken(user.getId(), "CUSTOMER"),
                    "cartItemId", item.getId(), "addressId", address.getId()));
        }
        User staff = newUser("E2E Staff", User.Role.STAFF);
        result.put("staffToken", jwt.generateAccessToken(staff.getId(), "STAFF"));
        return result;
    }

    private User newUser(String name, User.Role role) {
        User user = User.builder().name(name).email(UUID.randomUUID() + "@example.test")
                .hasPassword(false).role(role).isActive(true).build();
        em.persist(user);
        return user;
    }
}
