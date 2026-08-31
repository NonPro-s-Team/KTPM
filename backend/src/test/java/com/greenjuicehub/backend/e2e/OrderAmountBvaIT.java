package com.greenjuicehub.backend.e2e;

import com.fasterxml.jackson.databind.*;
import com.greenjuicehub.backend.entity.*;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.shipping.GhnService;
import com.greenjuicehub.backend.utils.JwtUtil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.cors.CorsConfigurationSource;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Explicit opt-in API experiment; production code is unchanged. See evidence README. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "server.address=127.0.0.1", "spring.jpa.hibernate.ddl-auto=none",
        "jwt.secret=qlpt293-local-only-signing-secret-at-least-32-bytes",
        "app.sepay.api-key=qlpt293-local-sepay-key", "vnpay.tmn-code=BVA293",
        "vnpay.hash-secret=qlpt293-local-vnpay-key", "vnpay.pay-url=http://127.0.0.1/never-open-payment",
        "vnpay.return-url=http://127.0.0.1/never-open-return"
})
@ActiveProfiles("test")
class OrderAmountBvaIT {
    private static final ObjectMapper JSON = new ObjectMapper().enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);
    private static final Path OUT = Path.of(System.getProperty("bva.output", "../test-evidence/order-total-amount-bva")).toAbsolutePath().normalize();
    private static final String SCHEMA = "qlpt293_bva_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    private static String dbUrl, dbUser, dbPassword;
    private static final boolean MYSQL = !"h2".equals(System.getProperty("bva.database"));
    @LocalServerPort int port;
    @Autowired EntityManager em;
    @Autowired TransactionTemplate tx;
    @Autowired JwtUtil jwt;
    @MockitoBean TokenBlacklistService blacklist;
    @MockitoBean GhnService ghn;
    @MockitoBean(name = "corsConfigurationSource") CorsConfigurationSource cors;
    private final HttpClient http = HttpClient.newHttpClient();
    private final List<Map<String,Object>> results = new ArrayList<>();
    private final List<Map<String,Object>> exchanges = new ArrayList<>();
    private final List<Map<String,Object>> checks = new ArrayList<>();
    private String token, adminToken;
    private long userId, addressId, ghnAddressId, productId, variantId, cartId;

    @DynamicPropertySource
    static void isolatedMysql(DynamicPropertyRegistry registry) throws Exception {
        if(!MYSQL) {
            dbUrl="jdbc:h2:mem:"+SCHEMA+";MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE;NON_KEYWORDS=VALUE";dbUser="sa";dbPassword="";
            registry.add("spring.datasource.url",()->dbUrl);registry.add("spring.datasource.username",()->dbUser);registry.add("spring.datasource.password",()->dbPassword);
            registry.add("spring.datasource.driver-class-name",()->"org.h2.Driver");registry.add("spring.jpa.hibernate.ddl-auto",()->"create-drop");
            Files.createDirectories(OUT);
            write("test-environment.json",Map.of("schema",SCHEMA,"database","H2 MySQL mode; JPA generated schema, NOT MySQL","startedAt",Instant.now().toString(),"isolation","ephemeral in-memory DB; existing MySQL untouched","externalServices","GHN and token blacklist mocked; local signed VNPay/SePay callbacks","limitation","MySQL login rejected project-config credentials; H2 cannot prove production MySQL behavior"));
            return;
        }
        Properties env = new Properties();
        for (String line : Files.readAllLines(Path.of(".env"))) {
            int split = line.indexOf('=');
            if (split > 0 && !line.stripLeading().startsWith("#")) {
                String value = line.substring(split + 1).trim();
                if (value.length() >= 2 && ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'")))) value = value.substring(1, value.length()-1);
                env.setProperty(line.substring(0,split).trim(), value);
            }
        }
        String configured = env.getProperty("SPRING_DATASOURCE_URL", "");
        if (!configured.matches("jdbc:mysql://(localhost|127\\.0\\.0\\.1)(:3306)?/.*")) throw new IllegalStateException("Only local MySQL is allowed; no remote database access");
        dbUser = env.getProperty("SPRING_DATASOURCE_USERNAME", "root");
        dbPassword = env.getProperty("SPRING_DATASOURCE_PASSWORD", "");
        Path localConfig=Path.of("src/main/resources/application-local.yml");
        if(dbPassword.isBlank() && Files.exists(localConfig)) {
            Map<?,?> local=new org.yaml.snakeyaml.Yaml().load(Files.readString(localConfig));
            Map<?,?> spring=(Map<?,?>)local.get("spring");
            Map<?,?> datasource=(Map<?,?>)spring.get("datasource");
            dbPassword=Objects.toString(datasource.get("password"),"");
        }
        String root = "jdbc:mysql://127.0.0.1:3306/";
        String options = "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh&characterEncoding=UTF-8";
        try (Connection c = DriverManager.getConnection(root + options, dbUser, dbPassword); Statement s = c.createStatement()) {
            s.executeUpdate("CREATE DATABASE `" + SCHEMA + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }
        dbUrl = root + SCHEMA + options;
        String sql = Files.readString(Path.of("../database/schema.sql"))
                .replaceAll("(?m)^CREATE DATABASE[^\\r\\n]*[\\r\\n]*", "")
                .replaceAll("(?m)^USE green_juice_hub;[\\r\\n]*", "");
        if (sql.contains("USE green_juice_hub") || sql.contains("CREATE DATABASE")) throw new IllegalStateException("Unsafe schema script");
        try (Connection c = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            ScriptUtils.executeSqlScript(c, new ByteArrayResource(sql.getBytes(StandardCharsets.UTF_8)));
        }
        registry.add("spring.datasource.url", () -> dbUrl);
        registry.add("spring.datasource.username", () -> dbUser);
        registry.add("spring.datasource.password", () -> dbPassword);
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        Files.createDirectories(OUT);
        Files.writeString(OUT.resolve("test-environment.json"), JSON.writerWithDefaultPrettyPrinter().writeValueAsString(Map.of(
                "schema", SCHEMA, "database", "local MySQL, repository database/schema.sql", "startedAt", Instant.now().toString(),
                "isolation", "new schema; no existing data modified; retained for inspection", "externalServices", "GHN and token blacklist mocked; VNPay/SePay callbacks signed using local test keys")));
    }

    record Scenario(String name, String price, String type, String discount, boolean freeShip, boolean carrier,
                    String expectedDiscount, String expectedShip, String expectedTotal) {}

    @Test void executeBvaAndSaveEvidence() throws Exception {
        when(ghn.calculateShippingFee(anyInt(), anyString(), anyInt())).thenReturn(bd("19000"));
        tx.executeWithoutResult(s -> seed());
        List<Scenario> cases = List.of(
                new Scenario("baseline-fallback", "50000", "", "0", false,false,"0","30000","80000"),
                new Scenario("baseline-ghn-stub", "50000", "", "0",false,true,"0","19000","69000"),
                new Scenario("free-shipping", "50000", "FIXED", "0.01",true,false,"0.01","0","49999.99"),
                new Scenario("lower-plus-cent", "50000", "FIXED", "49999.99",true,false,"49999.99","0","0.01"),
                new Scenario("lower-zero", "50000", "FIXED", "50000",true,false,"50000","0","0"),
                new Scenario("lower-minus-candidate-clamped", "50000", "FIXED", "50000.01",true,false,"50000","0","0"),
                new Scenario("discount-below-subtotal-with-fee", "50000", "FIXED", "49999.99",false,false,"49999.99","30000","30000.01"),
                new Scenario("discount-equal-subtotal-with-fee", "50000", "FIXED", "50000",false,false,"50000","30000","30000"),
                new Scenario("discount-above-subtotal-with-fee", "50000", "FIXED", "50000.01",false,false,"50000","30000","30000"),
                new Scenario("percent-floor-below", "50009.99", "PERCENT", "10",true,false,"5000","0","45009.99"),
                new Scenario("percent-floor-at", "50010.00", "PERCENT", "10",true,false,"5001","0","45009"),
                new Scenario("percent-floor-above", "50010.01", "PERCENT", "10",true,false,"5001","0","45009.01"),
                new Scenario("percent-100", "50000", "PERCENT", "100",true,false,"50000","0","0")
        );
        try {
            for (String flow : List.of("BUY", "CART")) for (Scenario c : cases) runOrder(flow,c);
            supplemental();
            storageProbes();
            for (String flow : List.of("BUY", "CART")) for (String boundary : List.of("9999999999.98", "9999999999.99", "10000000000.00")) {
                results.add(Map.of("id", flow+"-upper-"+boundary, "status","Blocked", "layer","System/API", "expected", "Assess storage boundary without unrealistic sales data", "actual", "No realistic catalog/stock fixture produces this total. No huge order fabricated. See separate storage probe statuses; H2 does not establish MySQL behavior."));
            }
            results.add(Map.of("id","LIVE-GHN", "status","Blocked", "layer","External integration", "expected","Real GHN quote and carrier geography", "actual","Not contacted; deterministic GHN stub is not evidence of live carrier behavior."));
            results.add(Map.of("id","LIVE-VNPAY", "status","Blocked", "layer","External integration", "expected","Gateway accepts amount and delivers callbacks", "actual","Only local create-url and correctly signed simulated IPN/Return executed; no real payment."));
        } finally {
            write("test-results.json", results);
            write("api-evidence.json", exchanges);
            write("assertion-results.json", checks);
        }
        assertFalse(exchanges.isEmpty(), "No API evidence collected");
        assertTrue(results.size() >= 30, "Execution incomplete; inspect log");
        if(Boolean.getBoolean("bva.failOnFindings")) assertTrue(checks.stream().allMatch(c->c.get("status").equals("Pass")),"Confirmed product findings: see test-results.json and assertion-results.json; all evidence was saved before this assertion");
    }

    private void seed() {
        if(!MYSQL) em.createNativeQuery("alter table orders alter column shipping_address varchar(10000)").executeUpdate();
        User user = User.builder().name("QLPT293 customer").email("customer@qlpt293.example.test").hasPassword(false).role(User.Role.CUSTOMER).isActive(true).build();
        em.persist(user); userId=user.getId(); token=jwt.generateAccessToken(userId,"CUSTOMER");
        User admin=User.builder().name("QLPT293 admin").email("admin@qlpt293.example.test").hasPassword(false).role(User.Role.ADMIN).isActive(true).build();
        em.persist(admin); adminToken=jwt.generateAccessToken(admin.getId(),"ADMIN");
        for(boolean carrier:List.of(false,true)) {
            Address a=Address.builder().user(user).fullName("Khach kiem thu").phone("0900000000").province("Hồ Chí Minh")
                    .district("Quận 1").ward("Phường kiểm thử").detail("Test only - do not ship").isDefault(!carrier)
                    .districtId(carrier?1454:null).wardCode(carrier?"20101":null).build();
            em.persist(a); if(carrier) ghnAddressId=a.getId(); else addressId=a.getId();
        }
        Category cat=Category.builder().name("BVA juice").slug("bva-juice").sortOrder(0).isActive(true).build(); em.persist(cat);
        Product p=Product.builder().category(cat).name("BVA juice").slug("bva-juice").avgRating(0f).reviewCount(0).isDeleted(false).isActive(true).build(); em.persist(p); productId=p.getId();
        ProductVariant v=ProductVariant.builder().product(p).originalPrice(bd("50000")).salePrice(bd("50000")).discountPercent(BigDecimal.ZERO).stockQty(1000).isActive(true).sortOrder(0).weightGram(500).build(); em.persist(v);variantId=v.getId();
        Cart cart=Cart.builder().user(user).build(); em.persist(cart);cartId=cart.getId();
    }

    private Map<String,Object> requestFor(String flow, String price, String method) {
        Map<String,Object> b=new LinkedHashMap<>();
        tx.executeWithoutResult(s -> {
            ProductVariant v=ProductVariant.builder().product(em.find(Product.class,productId)).originalPrice(bd(price)).salePrice(bd(price)).discountPercent(BigDecimal.ZERO).stockQty(1000).isActive(true).sortOrder(0).weightGram(500).build();
            em.persist(v);variantId=v.getId();
            if(flow.equals("CART")) {
                CartItem ci=CartItem.builder().cart(em.find(Cart.class,cartId)).product(em.find(Product.class,productId)).variant(v).quantity(1).build();em.persist(ci);
                b.put("cartItemIds",List.of(ci.getId()));
            } else {b.put("variantId",variantId);b.put("quantity",1);}
        });
        b.put("addressId",addressId); b.put("paymentMethod",method);return b;
    }

    private void runOrder(String flow,Scenario c) throws Exception {
        String id=flow+"-"+c.name(); int start=checks.size();
        Map<String,Object> b=requestFor(flow,c.price(),"VNPAY");b.put("note","QLPT-293 "+id);
        if(c.carrier()) b.put("addressId",ghnAddressId);
        if(!c.type().isEmpty()) {
            String code="BVA_"+UUID.randomUUID().toString().substring(0,8);
            Map<String,Object> promo=promotion(code,c.type(),c.discount(),c.freeShip());
            JsonNode created=call(id,"POST","/api/admin/promotions",promo,adminToken,201);
            check(id,"promotion created",created.has("id"),"id",created.toString()); b.put("promoCode",code);
            Map<String,Object> preview=new LinkedHashMap<>(b);preview.put("promoCode",code);
            JsonNode quote=call(id,"POST","/api/orders/apply-promo",preview,token,200);
            money(id,"promo preview discount",c.expectedDiscount(),quote.path("discountAmount"));
        }
        JsonNode fee=call(id,"POST","/api/orders/shipping-fee",b,token,200);
        money(id,"base shipping quote (before promotion)",c.carrier()?"19000":"30000",fee.path("shippingFee"));
        Map<String,Object> before=snapshot();
        JsonNode o=call(id,"POST",flow.equals("BUY")?"/api/orders/buy-now":"/api/orders",b,token,200);
        if(o.has("id")) {
            long oid=o.path("id").asLong();
            money(id,"response subtotal",c.price(),o.path("subtotal"));
            money(id,"response discount",c.expectedDiscount(),o.path("discountAmount"));
            money(id,"response shipping",c.expectedShip(),o.path("shippingFee"));
            money(id,"response total",c.expectedTotal(),o.path("totalAmount"));
            BigDecimal sum=BigDecimal.ZERO;for(JsonNode item:o.path("items")) sum=sum.add(item.path("subtotal").decimalValue());
            check(id,"sum API order_items.subtotal",sum.compareTo(bd(c.price()))==0,c.price(),sum.toPlainString());
            JsonNode fetched=call(id,"GET","/api/orders/"+oid,null,token,200);
            for(String field:List.of("subtotal","discountAmount","shippingFee","totalAmount")) check(id,"GET matches POST "+field,fetched.path(field).decimalValue().compareTo(o.path(field).decimalValue())==0,o.path(field).asText(),fetched.path(field).asText());
            Map<String,Object> db=dbOrder(oid);
            for(String field:List.of("subtotal","discount_amount","shipping_fee","total_amount","amount","items_subtotal")) {
                String expected=switch(field){case "subtotal","items_subtotal" -> c.price();case "discount_amount" -> c.expectedDiscount();case "shipping_fee" -> c.expectedShip();default -> c.expectedTotal();};
                check(id,"DB "+field,bd(db.get(field).toString()).compareTo(bd(expected))==0,expected,db.get(field).toString());
            }
            JsonNode url=call(id,"POST","/api/payment/vnpay/create-url",Map.of("orderId",oid),token,200);
            Map<String,String> params=parseQuery(URI.create(url.path("paymentUrl").asText()).getRawQuery());
            String amount=bd(c.expectedTotal()).movePointRight(2).toBigIntegerExact().toString();
            check(id,"VNPay vnp_Amount = DB total * 100",amount.equals(params.get("vnp_Amount")),amount,params.get("vnp_Amount"));
            if(bd(c.expectedTotal()).signum()>0) {
                for(int delta:List.of(-1,1)) {
                    String bad=bd(c.expectedTotal()).movePointRight(2).add(BigDecimal.valueOf(delta)).toPlainString();
                    JsonNode ipn=callback(id,"ipn",o,bad,true);
                    check(id,"IPN mismatch "+delta,ipn.path("RspCode").asText().equals("04"),"04",ipn.toString());
                    check(id,"mismatch leaves pending",dbOrder(oid).get("payment_status").equals("PENDING"),"PENDING",dbOrder(oid).get("payment_status"));
                }
                JsonNode invalid=callback(id,"ipn",o,amount,false);check(id,"invalid signature",invalid.path("RspCode").asText().equals("97"),"97",invalid.toString());
                JsonNode ret=callback(id,"return",o,amount,true);check(id,"Return display only",ret.path("success").asBoolean()&&!ret.path("confirmed").asBoolean()&&dbOrder(oid).get("payment_status").equals("PENDING"),"success=true,confirmed=false,DB=PENDING",ret.toString());
            }
            JsonNode ipn=callback(id,"ipn",o,amount,true);
            // Cross-component contract: a generated payable URL must be processable with its own exact amount.
            check(id,"exact amount accepted after URL issued",ipn.path("RspCode").asText().equals("00"),"00",ipn.toString());
            JsonNode ret=callback(id,"return",o,amount,true);
            check(id,"exact callback completes online order",ret.path("confirmed").asBoolean()&&dbOrder(oid).get("payment_status").equals("PAID"),"confirmed=true, DB=PAID",ret.toString());
            if(bd(c.expectedTotal()).signum()>0) callback(id,"ipn",o,amount,true);
            Map<String,Object> after=dbOrder(oid);
            check(id,"payment amount preserved",bd(after.get("amount").toString()).compareTo(bd(c.expectedTotal()))==0,c.expectedTotal(),after.get("amount"));
            results.add(result(id,start,Map.of("input",b,"price",c.price(),"quantity",1,"expected",Map.of("subtotal",c.price(),"discount",c.expectedDiscount(),"shipping",c.expectedShip(),"total",c.expectedTotal()),"before",before,"dbAfterCreate",db,"dbAfterCallback",after,"actual",o)));
        } else results.add(result(id,start,Map.of("input",b,"actual",o,"before",before,"after",snapshot())));
    }

    private void supplemental() throws Exception {
        when(ghn.getProvinces()).thenReturn(List.of(Map.of("ProvinceID",202,"ProvinceName","Hồ Chí Minh")));
        when(ghn.getDistricts(202)).thenReturn(List.of(Map.of("DistrictID",1454,"DistrictName","Quận 1")));
        when(ghn.getWards(1454)).thenReturn(List.of(Map.of("WardCode","20101","WardName","Phường kiểm thử")));
        for(String path:List.of("/api/shipping/provinces","/api/shipping/districts?provinceId=202","/api/shipping/wards?districtId=1454")) {
            String id="SHIPPING-"+path.substring(path.lastIndexOf('/')+1);int start=checks.size();JsonNode actual=call(id,"GET",path,null,null,200);
            check(id,"geography controller forwards stub",actual.isArray()&&actual.size()==1,"one configured carrier fixture",actual.toString());
            results.add(result(id,start,Map.of("expected","HTTP 200 with configured GHN geography stub; contract only, NOT live carrier data","actual",actual)));
        }
        for(String flow:List.of("BUY","CART")) {
            String id=flow+"-zero-COD";int start=checks.size();Map<String,Object>b=requestFor(flow,"50000","COD");
            String code="ZERO_"+flow;call(id,"POST","/api/admin/promotions",promotion(code,"FIXED","50000",true),adminToken,201);b.put("promoCode",code);
            JsonNode actual=call(id,"POST",flow.equals("BUY")?"/api/orders/buy-now":"/api/orders",b,token,200);money(id,"zero is accepted by Order implementation","0",actual.path("totalAmount"));
            results.add(result(id,start,Map.of("expected","Characterization: zero accepted and stored; not a new business rule","actual",actual,"input",b,"db",dbOrder(actual.path("id").asLong()))));
        }
        for(int quantity:List.of(-1,0)) {
            String id="INPUT-quantity-"+quantity;int start=checks.size();Map<String,Object>b=requestFor("BUY","50000","COD");b.put("quantity",quantity);Map<String,Object>before=snapshot();
            JsonNode actual=call(id,"POST","/api/orders/buy-now",b,token,400);check(id,"no DB mutation",before.equals(snapshot()),before,snapshot());results.add(result(id,start,Map.of("expected","400; unchanged orders/payments/stock","actual",actual,"input",b,"before",before,"after",snapshot())));
        }
        String id="INPUT-empty-cart";int start=checks.size();Map<String,Object>b=new LinkedHashMap<>(Map.of("addressId",addressId,"paymentMethod","COD","cartItemIds",List.of()));Map<String,Object>before=snapshot();JsonNode actual=call(id,"POST","/api/orders",b,token,400);check(id,"no DB mutation",before.equals(snapshot()),before,snapshot());results.add(result(id,start,Map.of("expected","400; no zero-item order","actual",actual,"input",b,"before",before,"after",snapshot())));
        id="INPUT-percent-over-100";start=checks.size();Map<String,Object>p=promotion("OVER100","PERCENT","100.01",true);actual=call(id,"POST","/api/admin/promotions",p,adminToken,400);results.add(result(id,start,Map.of("expected","400; percent >100 prevented at admin API","actual",actual,"input",p)));
        for(String flow:List.of("BUY","CART")) {
            id=flow+"-client-money-tampering";start=checks.size();b=requestFor(flow,"50000","COD");b.put("totalAmount",-0.01);b.put("subtotal",0);b.put("discountAmount",999999);b.put("shippingFee",-50000);
            actual=call(id,"POST",flow.equals("BUY")?"/api/orders/buy-now":"/api/orders",b,token,200);money(id,"client money ignored","80000",actual.path("totalAmount"));results.add(result(id,start,Map.of("input",b,"expected","Backend computes 80000 independently","actual",actual,"db",dbOrder(actual.path("id").asLong()))));
        }
        for(String method:List.of("BANK_TRANSFER","MOMO")) for(int delta:List.of(-1,0,1)) {
            id="SEPAY-"+method+"-delta-"+delta;start=checks.size();b=requestFor("BUY","50000",method);JsonNode o=call(id,"POST","/api/orders/buy-now",b,token,200);long oid=o.path("id").asLong();
            Map<String,Object>body=Map.of("transferType","in","transferAmount",bd("80000").add(bd("0.01").multiply(BigDecimal.valueOf(delta))),"content",o.path("orderCode").asText(),"referenceCode",id);
            actual=call(id,"POST","/api/webhooks/sepay",body,"Apikey qlpt293-local-sepay-key",200);Map<String,Object>db=dbOrder(oid);String expected=delta<0?"PENDING":"PAID";check(id,"SePay threshold",expected.equals(db.get("payment_status")),expected,db.get("payment_status"));check(id,"payment amount unchanged",bd(db.get("amount").toString()).compareTo(bd("80000"))==0,"80000",db.get("amount"));results.add(result(id,start,Map.of("expected",expected+"; amount remains 80000", "actual",actual,"input",body,"db",db)));
        }
        for(String flow:List.of("BUY","CART")) {
            id=flow+"-negative-GHN-fault-injection";start=checks.size();when(ghn.calculateShippingFee(anyInt(),anyString(),anyInt())).thenReturn(bd("-50001"));b=requestFor(flow,"50000","COD");b.put("addressId",ghnAddressId);
            tx.executeWithoutResult(s->{ProductVariant v=em.find(ProductVariant.class,variantId);v.setOriginalPrice(bd("50000.99"));v.setSalePrice(bd("50000.99"));});
            actual=call(id,"POST",flow.equals("BUY")?"/api/orders/buy-now":"/api/orders",b,token,200);
            money(id,"characterize negative total from injected carrier fee","-0.01",actual.path("totalAmount"));
            results.add(result(id,start,Map.of("layerNote","Robustness characterization; GHN stub=-50001, price=50000.99, quantity=1; not a normal carrier response","expected","Observe -0.01 persistence; no business min inferred","actual",actual,"input",b,"db",dbOrder(actual.path("id").asLong()),"note","Negative total persistence is a conditional risk, not a confirmed normal-flow business-boundary violation")));
            when(ghn.calculateShippingFee(anyInt(),anyString(),anyInt())).thenReturn(bd("19000"));
        }
    }

    private void storageProbes() throws Exception {
        if(!MYSQL) {
            for(String boundary:List.of("-0.01","0","0.01","9999999999.98","9999999999.99","10000000000.00")) results.add(Map.of("id","MYSQL-DECIMAL-"+boundary,"status","Blocked","layer","MySQL storage","input",boundary,"expected","Exact storage or overflow rejection on actual MySQL","actual","MySQL credentials unavailable; H2 result must not substitute for MySQL."));
            return;
        }
        try(Connection c=DriverManager.getConnection(dbUrl,dbUser,dbPassword);Statement s=c.createStatement()) {
            List<Map<String,Object>> metadata=new ArrayList<>();
            try(ResultSet rs=s.executeQuery("SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT FROM information_schema.columns WHERE table_schema=DATABASE() AND ((table_name='orders' AND column_name IN ('subtotal','discount_amount','shipping_fee','total_amount')) OR (table_name='payments' AND column_name='amount'))")) {while(rs.next()){Map<String,Object>row=new LinkedHashMap<>();for(int i=1;i<=5;i++)row.put(rs.getMetaData().getColumnLabel(i),rs.getString(i));metadata.add(row);}}
            write("schema-columns.json",metadata);
            try(ResultSet rs=s.executeQuery("SELECT VERSION(),@@SESSION.sql_mode")){rs.next();write("mysql-runtime.json",Map.of("version",rs.getString(1),"sqlMode",rs.getString(2)));}
            s.execute("CREATE TEMPORARY TABLE bva_decimal_probe (amount DECIMAL(12,2) NOT NULL)");
            for(String value:List.of("-0.01","0","0.01","9999999999.98","9999999999.99","10000000000.00")) {
                String id="DB-DECIMAL-"+value;boolean overflow=value.equals("10000000000.00");String actual;boolean pass;
                try(PreparedStatement p=c.prepareStatement("INSERT INTO bva_decimal_probe(amount) VALUES (?)")){p.setBigDecimal(1,bd(value));p.executeUpdate();try(ResultSet rs=s.executeQuery("SELECT amount FROM bva_decimal_probe")){rs.next();actual=rs.getBigDecimal(1).toPlainString();pass=!overflow&&bd(actual).compareTo(bd(value))==0;}}
                catch(SQLException e){actual="SQLState="+e.getSQLState()+", code="+e.getErrorCode();pass=overflow&&"22001".equals(e.getSQLState());}
                results.add(Map.of("id",id,"layer","MySQL temporary DECIMAL column; not Order API","input",value,"expected",overflow?"reject out of range":"exact storage","actual",actual,"status",pass?"Pass":"Fail"));s.executeUpdate("DELETE FROM bva_decimal_probe");
            }
        }
    }

    private Map<String,Object> promotion(String code,String type,String value,boolean free) {
        return Map.of("code",code,"name","QLPT293 "+code,"type",type,"value",bd(value),"minOrderValue",0,"target","PUBLIC","freeShipping",free,"startsAt",LocalDateTime.now().minusDays(1).toString(),"endsAt",LocalDateTime.now().plusDays(2).toString(),"isActive",true);
    }
    private JsonNode callback(String id,String route,JsonNode order,String amount,boolean valid) throws Exception {
        Map<String,String> p=new TreeMap<>(Map.of("vnp_TmnCode","BVA293","vnp_TxnRef",order.path("orderCode").asText(),"vnp_Amount",amount,"vnp_ResponseCode","00","vnp_TransactionStatus","00","vnp_TransactionNo","293"+order.path("id").asText()));
        String query=query(p);Mac mac=Mac.getInstance("HmacSHA512");mac.init(new SecretKeySpec("qlpt293-local-vnpay-key".getBytes(StandardCharsets.UTF_8),"HmacSHA512"));
        String signature=HexFormat.of().formatHex(mac.doFinal(query.getBytes(StandardCharsets.UTF_8)));
        return call(id,"GET","/api/payment/vnpay/"+route+"?"+query+"&vnp_SecureHash="+(valid?signature:"0".repeat(128)),null,null,200);
    }
    private JsonNode call(String id,String method,String path,Object body,String auth,int expectedStatus) throws Exception {
        String raw=body==null?"":JSON.writeValueAsString(body);HttpRequest.Builder b=HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+path)).timeout(Duration.ofSeconds(20)).header("Content-Type","application/json");
        if(auth!=null)b.header("Authorization",auth.startsWith("Apikey ")?auth:"Bearer "+auth);
        HttpResponse<String> r=http.send(b.method(method,HttpRequest.BodyPublishers.ofString(raw)).build(),HttpResponse.BodyHandlers.ofString());
        JsonNode response;try{response=JSON.readTree(r.body());}catch(Exception e){response=JSON.getNodeFactory().textNode(r.body());}
        Map<String,Object> ev=new LinkedHashMap<>();ev.put("case",id);ev.put("time",Instant.now().toString());ev.put("method",method);ev.put("path",path);ev.put("requestBody",body);ev.put("httpStatus",r.statusCode());ev.put("responseBody",response);ev.put("auth","test credentials omitted");exchanges.add(ev);
        check(id,method+" "+path.split("\\?")[0]+" status",r.statusCode()==expectedStatus,expectedStatus,r.statusCode());return response;
    }
    private Map<String,Object> dbOrder(long id) {
        return tx.execute(s->{Object[] r=(Object[])em.createNativeQuery("SELECT o.subtotal,o.discount_amount,o.shipping_fee,o.total_amount,p.amount,o.payment_status,p.status,(SELECT SUM(i.subtotal) FROM order_items i WHERE i.order_id=o.id) FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.id=:id").setParameter("id",id).getSingleResult();Map<String,Object> m=new LinkedHashMap<>();String[]names={"subtotal","discount_amount","shipping_fee","total_amount","amount","payment_status","payment_record_status","items_subtotal"};for(int i=0;i<names.length;i++)m.put(names[i],r[i].toString());m.put("orderId",id);return m;});
    }
    private Map<String,Object> snapshot(){return tx.execute(s->Map.of("orders",em.createQuery("select count(o) from Order o").getSingleResult(),"payments",em.createQuery("select count(p) from Payment p").getSingleResult(),"stock",em.find(ProductVariant.class,variantId).getStockQty()));}
    private void money(String id,String name,String expected,JsonNode actual){check(id,name,actual.isNumber()&&actual.decimalValue().compareTo(bd(expected))==0,expected,actual.asText());}
    private void check(String id,String name,boolean pass,Object expected,Object actual){checks.add(Map.of("case",id,"check",name,"status",pass?"Pass":"Fail","expected",expected,"actual",actual==null?"null":actual));}
    private Map<String,Object> result(String id,int start,Map<String,Object>data){Map<String,Object>r=new LinkedHashMap<>(data);r.put("id",id);r.put("layer",MYSQL?"HTTP API + real MySQL; carrier stub":"HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL");r.put("status",checks.subList(start,checks.size()).stream().allMatch(c->c.get("status").equals("Pass"))?"Pass":"Fail");r.put("checks",new ArrayList<>(checks.subList(start,checks.size())));return r;}
    private static BigDecimal bd(String s){return new BigDecimal(s);}
    private static String query(Map<String,String>p){return new TreeMap<>(p).entrySet().stream().map(e->URLEncoder.encode(e.getKey(),StandardCharsets.US_ASCII)+"="+URLEncoder.encode(e.getValue(),StandardCharsets.US_ASCII)).reduce((a,b)->a+"&"+b).orElse("");}
    private static Map<String,String>parseQuery(String q){Map<String,String>p=new HashMap<>();for(String pair:q.split("&")){String[]kv=pair.split("=",2);p.put(URLDecoder.decode(kv[0],StandardCharsets.US_ASCII),URLDecoder.decode(kv[1],StandardCharsets.US_ASCII));}return p;}
    private static void write(String name,Object value)throws Exception{Files.createDirectories(OUT);Files.writeString(OUT.resolve(name),JSON.writerWithDefaultPrettyPrinter().writeValueAsString(value));}
}
