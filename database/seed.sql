-- ============================================================
-- GREEN JUICE HUB — DỮ LIỆU MẪU LOCAL
-- Mục tiêu: gần 1.000 bản ghi có quan hệ đầy đủ, phục vụ demo/admin.
-- An toàn khi chạy lại: nếu đã có seed.user*@greenjuicehub.local,
-- script sẽ dừng và không chèn trùng dữ liệu.
-- Mật khẩu chung của tài khoản seed: password
-- ============================================================

SET NAMES utf8mb4;
USE green_juice_hub;

DELIMITER $$

DROP PROCEDURE IF EXISTS seed_green_juice_hub$$

CREATE PROCEDURE seed_green_juice_hub()
seed_main: BEGIN
    DECLARE v_i INT DEFAULT 1;
    DECLARE v_j INT DEFAULT 1;
    DECLARE v_size_seq INT;
    DECLARE v_product_seq INT;
    DECLARE v_variant_sort INT;

    DECLARE v_user_id BIGINT;
    DECLARE v_product_id BIGINT;
    DECLARE v_variant_id BIGINT;
    DECLARE v_flavor_id BIGINT;
    DECLARE v_size_id BIGINT;
    DECLARE v_cart_id BIGINT;
    DECLARE v_promo_id BIGINT;
    DECLARE v_order_id BIGINT;

    DECLARE v_name VARCHAR(100);
    DECLARE v_email VARCHAR(100);
    DECLARE v_username VARCHAR(50);
    DECLARE v_phone VARCHAR(15);
    DECLARE v_role VARCHAR(20);
    DECLARE v_district VARCHAR(100);
    DECLARE v_ward VARCHAR(100);
    DECLARE v_detail VARCHAR(255);
    DECLARE v_district_id INT;
    DECLARE v_ward_code VARCHAR(10);
    DECLARE v_product_name VARCHAR(200);
    DECLARE v_variant_name VARCHAR(100);
    DECLARE v_order_status VARCHAR(20);
    DECLARE v_payment_status VARCHAR(20);
    DECLARE v_payment_method VARCHAR(30);
    DECLARE v_payment_record_status VARCHAR(20);

    DECLARE v_sale_price DECIMAL(12,2);
    DECLARE v_original_price DECIMAL(12,2);
    DECLARE v_unit_price DECIMAL(12,2);
    DECLARE v_total_amount DECIMAL(12,2);
    DECLARE v_created_at DATETIME;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF EXISTS (
        SELECT 1
        FROM users
        WHERE email LIKE 'seed.%@greenjuicehub.local'
        LIMIT 1
    ) THEN
        SELECT 'Dữ liệu seed đã tồn tại, không chèn lại.' AS message;
        LEAVE seed_main;
    END IF;

    START TRANSACTION;

    -- --------------------------------------------------------
    -- 1. DANH MỤC, HƯƠNG VỊ, KÍCH THƯỚC, TAG
    -- --------------------------------------------------------
    INSERT INTO categories
        (name, slug, description, image_url, sort_order, is_active)
    VALUES
        ('Nước ép nguyên chất', 'seed-nuoc-ep-nguyen-chat',
         'Nước ép lạnh từ trái cây tươi, không pha nước, không chất bảo quản.',
         'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1200&q=80', 1, TRUE),
        ('Nước ép detox', 'seed-nuoc-ep-detox',
         'Công thức rau củ và trái cây cân bằng, hỗ trợ thanh lọc cơ thể mỗi ngày.',
         'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=1200&q=80', 2, TRUE),
        ('Smoothie dinh dưỡng', 'seed-smoothie-dinh-duong',
         'Smoothie sánh mịn từ trái cây, sữa hạt và ngũ cốc nguyên cám.',
         'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80', 3, TRUE),
        ('Sữa chua Hy Lạp', 'seed-sua-chua-hy-lap',
         'Sữa chua lọc thủ công, giàu protein, ít đường và men sống tự nhiên.',
         'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80', 4, TRUE),
        ('Granola & ăn nhẹ', 'seed-granola-an-nhe',
         'Granola nướng chậm cùng các loại hạt, phù hợp bữa sáng và bữa phụ.',
         'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1200&q=80', 5, TRUE);

    INSERT INTO flavors (name, is_active) VALUES
        ('Nguyên bản', TRUE), ('Cam', TRUE), ('Táo xanh', TRUE), ('Dứa', TRUE),
        ('Xoài', TRUE), ('Dâu', TRUE), ('Việt quất', TRUE), ('Chocolate đen', TRUE);

    INSERT INTO sizes (name, is_active) VALUES
        ('Chai 300ml', TRUE), ('Chai 500ml', TRUE), ('Chai 1L', TRUE),
        ('Hũ 200g', TRUE), ('Hũ 500g', TRUE), ('Gói 250g', TRUE),
        ('Gói 500g', TRUE), ('Combo gia đình', TRUE);

    INSERT IGNORE INTO tag_definitions (name, is_active, sort_order) VALUES
        ('detox', TRUE, 5),
        ('high-protein', TRUE, 6),
        ('vegan', TRUE, 7),
        ('low-calorie', TRUE, 8),
        ('probiotic', TRUE, 9),
        ('combo', TRUE, 10);

    -- --------------------------------------------------------
    -- 2. 30 SẢN PHẨM THỰC TẾ
    -- --------------------------------------------------------
    INSERT INTO products
        (category_id, name, slug, description, avg_rating, review_count, is_active, is_deleted)
    VALUES
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-nguyen-chat'), 'Cam Valencia Nguyên Chất', 'seed-cam-valencia-nguyen-chat', 'Cam Valencia mọng nước ép lạnh trong ngày, vị chua ngọt tự nhiên và giàu vitamin C.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-nguyen-chat'), 'Ổi Hồng Vitamin C', 'seed-oi-hong-vitamin-c', 'Ổi hồng tuyển chọn kết hợp một lát chanh vàng, thơm dịu và không thêm đường.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-nguyen-chat'), 'Dứa Bạc Hà Thanh Mát', 'seed-dua-bac-ha-thanh-mat', 'Dứa chín tự nhiên cùng lá bạc hà, phù hợp giải nhiệt sau vận động.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-nguyen-chat'), 'Táo Xanh Cần Tây', 'seed-tao-xanh-can-tay', 'Táo xanh cân bằng vị cần tây, cung cấp chất chống oxy hóa và ít calorie.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-nguyen-chat'), 'Dưa Hấu Chanh Vàng', 'seed-dua-hau-chanh-vang', 'Dưa hấu mọng nước, chanh vàng và một chút lá húng lủi.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-nguyen-chat'), 'Cà Rốt Cam Gừng', 'seed-ca-rot-cam-gung', 'Cà rốt Đà Lạt, cam tươi và gừng non tạo vị ấm nhẹ, giàu beta-carotene.', 0, 0, TRUE, FALSE),

        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-detox'), 'Detox Xanh Diệp Lục', 'seed-detox-xanh-diep-luc', 'Cải kale, táo xanh, dưa leo, cần tây và chanh; vị xanh dễ uống.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-detox'), 'Detox Đỏ Thanh Lọc', 'seed-detox-do-thanh-loc', 'Củ dền, táo đỏ, cà rốt và gừng hỗ trợ bổ sung vi chất sau ngày dài.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-detox'), 'Detox Vàng Tăng Đề Kháng', 'seed-detox-vang-tang-de-khang', 'Dứa, cam, nghệ tươi và chanh vàng với hương vị nhiệt đới.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-detox'), 'Detox Tím Chống Oxy Hóa', 'seed-detox-tim-chong-oxy-hoa', 'Bắp cải tím, nho đen, táo và chanh tạo màu tím tự nhiên.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-detox'), 'Detox Cần Tây Dứa', 'seed-detox-can-tay-dua', 'Cần tây hữu cơ kết hợp dứa chín giúp hương vị cân bằng và dễ dùng mỗi sáng.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-nuoc-ep-detox'), 'Detox Củ Dền Táo', 'seed-detox-cu-den-tao', 'Củ dền, táo Fuji và chanh dây; vị ngọt thanh không cần đường tinh luyện.', 0, 0, TRUE, FALSE),

        ((SELECT id FROM categories WHERE slug='seed-smoothie-dinh-duong'), 'Smoothie Xoài Chanh Dây', 'seed-smoothie-xoai-chanh-day', 'Xoài cát, chanh dây và sữa chua Hy Lạp tạo kết cấu sánh mịn.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-smoothie-dinh-duong'), 'Smoothie Bơ Hạnh Nhân', 'seed-smoothie-bo-hanh-nhan', 'Bơ sáp, sữa hạnh nhân không đường và hạt chia, giàu chất béo tốt.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-smoothie-dinh-duong'), 'Smoothie Chuối Bơ Đậu Phộng', 'seed-smoothie-chuoi-bo-dau-phong', 'Chuối già, bơ đậu phộng nguyên chất và yến mạch cho bữa phụ giàu năng lượng.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-smoothie-dinh-duong'), 'Smoothie Dâu Sữa Chua', 'seed-smoothie-dau-sua-chua', 'Dâu Đà Lạt, sữa chua Hy Lạp và mật ong hoa cà phê.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-smoothie-dinh-duong'), 'Smoothie Việt Quất Yến Mạch', 'seed-smoothie-viet-quat-yen-mach', 'Việt quất, yến mạch cán dẹt và sữa hạt; giàu chất xơ hòa tan.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-smoothie-dinh-duong'), 'Smoothie Matcha Chuối', 'seed-smoothie-matcha-chuoi', 'Matcha Nhật Bản, chuối và sữa yến mạch, hậu vị thanh nhẹ.', 0, 0, TRUE, FALSE),

        ((SELECT id FROM categories WHERE slug='seed-sua-chua-hy-lap'), 'Sữa Chua Hy Lạp Nguyên Bản', 'seed-sua-chua-hy-lap-nguyen-ban', 'Sữa chua lọc chậm 12 giờ, vị chua dịu, giàu protein và không chất làm đặc.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-sua-chua-hy-lap'), 'Sữa Chua Hy Lạp Mật Ong', 'seed-sua-chua-hy-lap-mat-ong', 'Sữa chua Hy Lạp ăn kèm mật ong nguyên chất đóng riêng.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-sua-chua-hy-lap'), 'Sữa Chua Hy Lạp Việt Quất', 'seed-sua-chua-hy-lap-viet-quat', 'Mứt việt quất nấu ít đường hòa cùng sữa chua dẻo mịn.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-sua-chua-hy-lap'), 'Sữa Chua Hy Lạp Xoài', 'seed-sua-chua-hy-lap-xoai', 'Xoài cát chín cắt hạt lựu, sốt xoài tươi và sữa chua nguyên bản.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-sua-chua-hy-lap'), 'Sữa Chua Hy Lạp Dâu', 'seed-sua-chua-hy-lap-dau', 'Dâu tươi Đà Lạt và sốt dâu nhà làm, vị chua ngọt cân bằng.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-sua-chua-hy-lap'), 'Sữa Chua Hy Lạp Không Đường', 'seed-sua-chua-hy-lap-khong-duong', 'Phiên bản không đường, phù hợp chế độ kiểm soát calorie và low-carb.', 0, 0, TRUE, FALSE),

        ((SELECT id FROM categories WHERE slug='seed-granola-an-nhe'), 'Granola Hạt Dinh Dưỡng', 'seed-granola-hat-dinh-duong', 'Yến mạch, hạnh nhân, hạt điều, hạt bí và mật ong nướng chậm.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-granola-an-nhe'), 'Granola Chocolate Đen', 'seed-granola-chocolate-den', 'Yến mạch cacao, chocolate đen 70% và hạnh nhân rang.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-granola-an-nhe'), 'Granola Trái Cây Nhiệt Đới', 'seed-granola-trai-cay-nhiet-doi', 'Granola giòn cùng xoài, dứa sấy lạnh và dừa lát.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-granola-an-nhe'), 'Thanh Hạt Năng Lượng', 'seed-thanh-hat-nang-luong', 'Thanh yến mạch, chà là và các loại hạt, tiện mang theo khi tập luyện.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-granola-an-nhe'), 'Combo Bữa Sáng Healthy', 'seed-combo-bua-sang-healthy', 'Combo sữa chua Hy Lạp, granola và trái cây tươi cho ba bữa sáng.', 0, 0, TRUE, FALSE),
        ((SELECT id FROM categories WHERE slug='seed-granola-an-nhe'), 'Hạt Mix Rang Mộc', 'seed-hat-mix-rang-moc', 'Hạnh nhân, hạt điều, óc chó và hạt bí rang mộc, không muối.', 0, 0, TRUE, FALSE);

    CREATE TEMPORARY TABLE tmp_seed_products (
        seq INT AUTO_INCREMENT PRIMARY KEY,
        id BIGINT NOT NULL UNIQUE
    );
    INSERT INTO tmp_seed_products (id)
    SELECT id FROM products WHERE slug LIKE 'seed-%' ORDER BY id;

    CREATE TEMPORARY TABLE tmp_seed_flavors (
        seq INT AUTO_INCREMENT PRIMARY KEY,
        id BIGINT NOT NULL UNIQUE
    );
    INSERT INTO tmp_seed_flavors (id)
    SELECT id FROM flavors
    WHERE name IN ('Nguyên bản','Cam','Táo xanh','Dứa','Xoài','Dâu','Việt quất','Chocolate đen')
    ORDER BY FIELD(name,'Nguyên bản','Cam','Táo xanh','Dứa','Xoài','Dâu','Việt quất','Chocolate đen');

    CREATE TEMPORARY TABLE tmp_seed_sizes (
        seq INT AUTO_INCREMENT PRIMARY KEY,
        id BIGINT NOT NULL UNIQUE
    );
    INSERT INTO tmp_seed_sizes (id)
    SELECT id FROM sizes
    WHERE name IN ('Chai 300ml','Chai 500ml','Chai 1L','Hũ 200g','Hũ 500g','Gói 250g','Gói 500g','Combo gia đình')
    ORDER BY FIELD(name,'Chai 300ml','Chai 500ml','Chai 1L','Hũ 200g','Hũ 500g','Gói 250g','Gói 500g','Combo gia đình');

    UPDATE products p
    JOIN tmp_seed_products sp ON sp.id = p.id
    SET p.created_at = DATE_SUB(NOW(), INTERVAL (95 - sp.seq * 2) DAY),
        p.updated_at = DATE_SUB(NOW(), INTERVAL (20 + MOD(sp.seq, 15)) DAY);

    SET v_i = 1;
    WHILE v_i <= 30 DO
        SELECT id INTO v_product_id FROM tmp_seed_products WHERE seq = v_i;

        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES
            (v_product_id,
             CONCAT(
                 CASE
                     WHEN v_i <= 6  THEN 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8'
                     WHEN v_i <= 12 THEN 'https://images.unsplash.com/photo-1610970881699-44a5587cabec'
                     WHEN v_i <= 18 THEN 'https://images.unsplash.com/photo-1505252585461-04db1eb84625'
                     WHEN v_i <= 24 THEN 'https://images.unsplash.com/photo-1488477181946-6428a0291777'
                     ELSE 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf'
                 END,
                 '?auto=format&fit=crop&w=900&q=82&sig=', v_i * 2), TRUE, 1),
            (v_product_id,
             CONCAT(
                 CASE
                     WHEN v_i <= 6  THEN 'https://images.unsplash.com/photo-1600271886742-f049cd451bba'
                     WHEN v_i <= 12 THEN 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97'
                     WHEN v_i <= 18 THEN 'https://images.unsplash.com/photo-1553530666-ba11a7da3888'
                     WHEN v_i <= 24 THEN 'https://images.unsplash.com/photo-1571212515416-fca77afa4d2c'
                     ELSE 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea'
                 END,
                 '?auto=format&fit=crop&w=900&q=82&sig=', v_i * 2 + 1), FALSE, 2);

        INSERT INTO product_tags (product_id, tag)
        VALUES
            (v_product_id,
             CASE
                 WHEN MOD(v_i, 5) = 0 THEN 'bestseller'
                 WHEN MOD(v_i, 4) = 0 THEN 'new'
                 ELSE 'organic'
             END),
            (v_product_id,
             CASE
                 WHEN v_i <= 6 THEN 'low-calorie'
                 WHEN v_i <= 12 THEN 'detox'
                 WHEN v_i <= 18 THEN 'vegan'
                 WHEN v_i <= 24 THEN 'probiotic'
                 ELSE 'combo'
             END);

        SELECT id INTO v_flavor_id
        FROM tmp_seed_flavors
        WHERE seq = MOD(v_i - 1, 8) + 1;

        SET v_j = 1;
        WHILE v_j <= 3 DO
            IF v_i <= 18 THEN
                SET v_size_seq = v_j;
            ELSEIF v_i <= 24 THEN
                SET v_size_seq = CASE v_j WHEN 1 THEN 4 WHEN 2 THEN 5 ELSE 8 END;
            ELSE
                SET v_size_seq = CASE v_j WHEN 1 THEN 6 WHEN 2 THEN 7 ELSE 8 END;
            END IF;

            SELECT id INTO v_size_id FROM tmp_seed_sizes WHERE seq = v_size_seq;

            SET v_sale_price = CASE
                WHEN v_i <= 12 THEN ELT(v_j, 39000, 59000, 109000)
                WHEN v_i <= 18 THEN ELT(v_j, 49000, 69000, 129000)
                WHEN v_i <= 24 THEN ELT(v_j, 45000, 89000, 165000)
                ELSE ELT(v_j, 79000, 139000, 249000)
            END;

            SET v_original_price = CASE
                WHEN MOD(v_i + v_j, 4) = 0 THEN ROUND(v_sale_price * 1.12, -3)
                WHEN MOD(v_i + v_j, 7) = 0 THEN ROUND(v_sale_price * 1.08, -3)
                ELSE v_sale_price
            END;

            INSERT INTO product_variants
                (product_id, flavor_id, size_id, original_price, sale_price,
                 discount_percent, stock_qty, is_active, sort_order, weight_gram)
            VALUES
                (v_product_id, v_flavor_id, v_size_id, v_original_price, v_sale_price,
                 ROUND((v_original_price - v_sale_price) * 100 / v_original_price, 2),
                 CASE WHEN MOD(v_i * 7 + v_j * 11, 19) = 0
                      THEN 0 ELSE 18 + MOD(v_i * 13 + v_j * 17, 95) END,
                 TRUE, v_j,
                 CASE
                     WHEN v_i <= 18 THEN ELT(v_j, 300, 500, 1000)
                     WHEN v_i <= 24 THEN ELT(v_j, 200, 500, 800)
                     ELSE ELT(v_j, 250, 500, 1000)
                 END);

            SET v_j = v_j + 1;
        END WHILE;

        SET v_i = v_i + 1;
    END WHILE;

    -- --------------------------------------------------------
    -- 3. 80 NGƯỜI DÙNG, ĐỊA CHỈ, TÀI KHOẢN XÃ HỘI, GIỎ HÀNG
    -- --------------------------------------------------------
    SET v_i = 1;
    WHILE v_i <= 80 DO
        SET v_name = CONCAT(
            ELT(MOD(v_i - 1, 10) + 1,
                'Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng'),
            ' ',
            ELT(MOD(v_i * 3 - 1, 16) + 1,
                'Minh Anh','Quang Huy','Thảo Vy','Gia Bảo','Ngọc Hà','Hoàng Nam','Khánh Linh','Tuấn Kiệt',
                'Phương Nhi','Đức Anh','Bảo Trâm','Thanh Tùng','Yến Nhi','Nhật Minh','Thu Trang','Hải Đăng')
        );

        SET v_email = CASE
            WHEN v_i = 80 THEN 'seed.admin@greenjuicehub.local'
            WHEN v_i >= 78 THEN CONCAT('seed.staff', LPAD(v_i - 77, 2, '0'), '@greenjuicehub.local')
            ELSE CONCAT('seed.user', LPAD(v_i, 3, '0'), '@greenjuicehub.local')
        END;
        SET v_username = CASE
            WHEN v_i = 80 THEN 'seed_admin'
            WHEN v_i >= 78 THEN CONCAT('seed_staff_', LPAD(v_i - 77, 2, '0'))
            ELSE CONCAT('seed_user_', LPAD(v_i, 3, '0'))
        END;
        SET v_phone = CONCAT('09', LPAD(10000000 + v_i, 8, '0'));
        SET v_role = CASE WHEN v_i = 80 THEN 'ADMIN' WHEN v_i >= 78 THEN 'STAFF' ELSE 'CUSTOMER' END;

        INSERT INTO users
            (name, phone, phone_verified_at, email, username, password_hash,
             has_password, avatar_url, role, is_active, created_at, updated_at)
        VALUES
            (v_name, v_phone, DATE_SUB(NOW(), INTERVAL MOD(v_i * 5, 160) DAY),
             v_email, v_username,
             '$2a$10$RakyV3X8kjvkYRK8pXClkO46dInrZ3C76J0nIl2qmzFoPGvBVfquq',
             TRUE, CONCAT('https://i.pravatar.cc/300?img=', MOD(v_i - 1, 70) + 1),
             v_role, IF(MOD(v_i, 37) = 0, FALSE, TRUE),
             DATE_SUB(NOW(), INTERVAL (190 - v_i) DAY),
             DATE_SUB(NOW(), INTERVAL MOD(v_i, 25) DAY));

        SET v_i = v_i + 1;
    END WHILE;

    CREATE TEMPORARY TABLE tmp_seed_users (
        seq INT AUTO_INCREMENT PRIMARY KEY,
        id BIGINT NOT NULL UNIQUE
    );
    INSERT INTO tmp_seed_users (id)
    SELECT id FROM users
    WHERE email LIKE 'seed.%@greenjuicehub.local'
    ORDER BY id;

    SET v_i = 1;
    WHILE v_i <= 80 DO
        SELECT u.id, u.name, u.phone
        INTO v_user_id, v_name, v_phone
        FROM users u
        JOIN tmp_seed_users su ON su.id = u.id
        WHERE su.seq = v_i;

        SET v_district = ELT(MOD(v_i - 1, 8) + 1,
            'Thành Phố Thủ Đức','Quận Thủ Đức','Quận Bình Thạnh','Quận Gò Vấp',
            'Quận Phú Nhuận','Quận 12','Quận 11','Quận 10');
        SET v_ward = ELT(MOD(v_i - 1, 8) + 1,
            'Phường An Khánh','Phường Trường Thọ','Phường 28','Phường 9',
            'Phường 17','Phường Trung Mỹ Tây','Phường 16','Phường 15');
        SET v_district_id = ELT(MOD(v_i - 1, 8) + 1, 3695,1463,1462,1461,1457,1454,1453,1452);
        SET v_ward_code = ELT(MOD(v_i - 1, 8) + 1, '90768','21812','21620','21316','21715','21211','21116','21015');
        SET v_detail = CONCAT(
            12 + MOD(v_i * 17, 280), '/', 1 + MOD(v_i, 9), ' ',
            ELT(MOD(v_i - 1, 8) + 1,
                'Đường Trần Não','Đường Đặng Văn Bi','Đường Điện Biên Phủ','Đường Phan Văn Trị',
                'Đường Phan Xích Long','Đường Trường Chinh','Đường Lạc Long Quân','Đường Sư Vạn Hạnh')
        );

        INSERT INTO addresses
            (user_id, full_name, phone, province, district, ward, detail,
             is_default, district_id, ward_code)
        VALUES
            (v_user_id, v_name, v_phone, 'Hồ Chí Minh', v_district, v_ward,
             v_detail, TRUE, v_district_id, v_ward_code);

        INSERT INTO carts (user_id, created_at, updated_at)
        VALUES (v_user_id,
                DATE_SUB(NOW(), INTERVAL MOD(v_i * 3, 120) DAY),
                DATE_SUB(NOW(), INTERVAL MOD(v_i, 12) DAY));

        IF v_i <= 10 THEN
            INSERT INTO social_accounts (user_id, provider, provider_id, email, created_at)
            SELECT v_user_id, 'GOOGLE', CONCAT('seed-google-', LPAD(v_i, 3, '0')),
                   email, DATE_SUB(NOW(), INTERVAL MOD(v_i * 7, 90) DAY)
            FROM users WHERE id = v_user_id;

            INSERT INTO otp_verifications
                (phone, otp_code, type, is_used, expires_at, created_at)
            VALUES
                (v_phone, LPAD(100000 + v_i, 6, '0'),
                 ELT(MOD(v_i - 1, 3) + 1, 'REGISTER','LOGIN','RESET_PASSWORD'),
                 MOD(v_i, 2) = 0,
                 DATE_ADD(NOW(), INTERVAL IF(MOD(v_i, 4) = 0, 5, -15) MINUTE),
                 DATE_SUB(NOW(), INTERVAL MOD(v_i * 3, 40) MINUTE));
        END IF;

        SET v_i = v_i + 1;
    END WHILE;

    -- 40 sản phẩm đang nằm trong giỏ của khách hàng.
    SET v_i = 1;
    WHILE v_i <= 40 DO
        SELECT u.id INTO v_user_id FROM tmp_seed_users u WHERE u.seq = v_i;
        SELECT id INTO v_cart_id FROM carts WHERE user_id = v_user_id;
        SET v_product_seq = MOD(v_i * 7 - 1, 30) + 1;
        SET v_variant_sort = MOD(v_i - 1, 3) + 1;
        SELECT id INTO v_product_id FROM tmp_seed_products WHERE seq = v_product_seq;
        SELECT id INTO v_variant_id
        FROM product_variants
        WHERE product_id = v_product_id AND sort_order = v_variant_sort
        LIMIT 1;

        INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, updated_at)
        VALUES (v_cart_id, v_product_id, v_variant_id,
                1 + MOD(v_i, 3), DATE_SUB(NOW(), INTERVAL MOD(v_i, 8) DAY));

        SET v_i = v_i + 1;
    END WHILE;

    -- --------------------------------------------------------
    -- 4. KHUYẾN MÃI
    -- --------------------------------------------------------
    INSERT INTO promotions
        (code, name, type, value, min_order_value, free_shipping, target,
         user_id, max_uses, max_uses_per_user, used_count,
         starts_at, ends_at, is_active)
    VALUES
        ('SEED_XANH10', 'Sống xanh giảm 10%', 'PERCENT', 10, 150000, FALSE, 'PUBLIC', NULL, 500, 2, 0, DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), TRUE),
        ('SEED_WELCOME50K', 'Chào bạn mới - giảm 50.000đ', 'FIXED', 50000, 299000, FALSE, 'PUBLIC', NULL, 300, 1, 0, DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), TRUE),
        ('SEED_FREESHIP', 'Miễn phí giao hàng nội thành', 'FIXED', 0, 200000, TRUE, 'PUBLIC', NULL, 1000, 3, 0, DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE),
        ('SEED_DETOX15', 'Tuần lễ Detox giảm 15%', 'PERCENT', 15, 250000, FALSE, 'PUBLIC', NULL, 250, 2, 0, DATE_SUB(NOW(), INTERVAL 300 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
        ('SEED_HEALTHY20', 'Combo Healthy giảm 20%', 'PERCENT', 20, 500000, TRUE, 'PUBLIC', NULL, 150, 1, 0, DATE_SUB(NOW(), INTERVAL 250 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), TRUE),
        ('SEED_WEEKEND30K', 'Cuối tuần vui khỏe - giảm 30.000đ', 'FIXED', 30000, 199000, FALSE, 'PUBLIC', NULL, 500, 2, 0, DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 75 DAY), TRUE),
        ('SEED_VIP25', 'Ưu đãi khách hàng thân thiết 25%', 'PERCENT', 25, 800000, TRUE, 'PUBLIC', NULL, 100, 1, 0, DATE_SUB(NOW(), INTERVAL 200 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), TRUE),
        ('SEED_YOGURT10', 'Sữa chua mỗi ngày giảm 10%', 'PERCENT', 10, 180000, FALSE, 'PUBLIC', NULL, 300, 2, 0, DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 120 DAY), TRUE),
        ('SEED_GRANOLA15', 'Granola giòn ngon giảm 15%', 'PERCENT', 15, 250000, FALSE, 'PUBLIC', NULL, 300, 2, 0, DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 120 DAY), TRUE),
        ('SEED_PERSONAL50', 'Quà sinh nhật riêng 50.000đ', 'FIXED', 50000, 200000, TRUE, 'PERSONAL', (SELECT id FROM tmp_seed_users WHERE seq=1), 1, 1, 0, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), TRUE);

    CREATE TEMPORARY TABLE tmp_seed_promotions (
        seq INT AUTO_INCREMENT PRIMARY KEY,
        id BIGINT NOT NULL UNIQUE
    );
    INSERT INTO tmp_seed_promotions (id)
    SELECT id FROM promotions WHERE code LIKE 'SEED_%' ORDER BY id;

    -- --------------------------------------------------------
    -- 5. 80 ĐƠN HÀNG VÀ 120 DÒNG SẢN PHẨM
    -- --------------------------------------------------------
    SET v_i = 1;
    WHILE v_i <= 80 DO
        SELECT id INTO v_user_id
        FROM tmp_seed_users
        WHERE seq = MOD(v_i - 1, 77) + 1;

        IF MOD(v_i, 5) = 0 THEN
            SELECT id INTO v_promo_id
            FROM tmp_seed_promotions
            WHERE seq = MOD((v_i DIV 5) - 1, 9) + 1;
        ELSE
            SET v_promo_id = NULL;
        END IF;

        SELECT full_name, phone, district, ward, detail, district_id, ward_code
        INTO v_name, v_phone, v_district, v_ward, v_detail, v_district_id, v_ward_code
        FROM addresses
        WHERE user_id = v_user_id
        ORDER BY is_default DESC, id
        LIMIT 1;

        SET v_order_status = CASE MOD(v_i, 10)
            WHEN 0 THEN 'CANCELLED'
            WHEN 1 THEN 'PENDING'
            WHEN 2 THEN 'CONFIRMED'
            WHEN 3 THEN 'SHIPPING'
            ELSE 'DELIVERED'
        END;
        SET v_payment_method = ELT(MOD(v_i - 1, 4) + 1, 'COD','VNPAY','MOMO','BANK_TRANSFER');
        SET v_payment_status = CASE
            WHEN v_order_status = 'DELIVERED' THEN 'PAID'
            WHEN v_order_status IN ('CONFIRMED','SHIPPING') AND v_payment_method <> 'COD' THEN 'PAID'
            WHEN v_order_status = 'CANCELLED' AND v_payment_method <> 'COD' AND MOD(v_i, 20) = 0 THEN 'REFUNDED'
            ELSE 'PENDING'
        END;
        SET v_created_at = DATE_SUB(NOW(), INTERVAL (81 - v_i) DAY);

        INSERT INTO orders
            (user_id, promotion_id, order_code, subtotal, discount_amount,
             shipping_fee, total_amount, status, payment_status,
             shipping_address, note, cancel_reason, cancelled_by, ghn_order_code,
             created_at, updated_at, expires_at)
        VALUES
            (v_user_id, v_promo_id, CONCAT('SEED-2026-', LPAD(v_i, 5, '0')),
             0, 0, 18000 + MOD(v_i, 5) * 4000, 0,
             v_order_status, v_payment_status,
             JSON_OBJECT(
                 'fullName', v_name,
                 'phone', v_phone,
                 'province', 'Hồ Chí Minh',
                 'district', v_district,
                 'ward', v_ward,
                 'detail', v_detail,
                 'districtId', v_district_id,
                 'wardCode', v_ward_code),
             ELT(MOD(v_i - 1, 6) + 1,
                 'Giao giờ hành chính giúp mình.',
                 'Vui lòng gọi trước khi giao 10 phút.',
                 'Để hàng tại quầy lễ tân nếu mình bận.',
                 'Ưu tiên chai lạnh, hạn dùng mới nhất.',
                 'Không cần túi nhựa, cảm ơn shop.',
                 NULL),
             IF(v_order_status = 'CANCELLED',
                ELT(MOD(v_i, 4) + 1,
                    'Khách thay đổi nhu cầu',
                    'Không liên hệ được người nhận',
                    'Thanh toán không thành công',
                    'Địa chỉ giao hàng chưa chính xác'), NULL),
             IF(v_order_status = 'CANCELLED', IF(MOD(v_i, 2)=0, 'CUSTOMER', 'SYSTEM'), NULL),
             IF(v_order_status IN ('CONFIRMED','SHIPPING','DELIVERED'), CONCAT('SEEDGHN', LPAD(v_i, 8, '0')), NULL),
             v_created_at,
             DATE_ADD(v_created_at, INTERVAL CASE
                 WHEN v_order_status='DELIVERED' THEN 2
                 WHEN v_order_status='SHIPPING' THEN 1
                 ELSE 0 END DAY),
             IF(v_order_status='PENDING' AND v_payment_method <> 'COD', DATE_ADD(NOW(), INTERVAL 1 DAY), NULL));

        SET v_i = v_i + 1;
    END WHILE;

    CREATE TEMPORARY TABLE tmp_seed_orders (
        seq INT AUTO_INCREMENT PRIMARY KEY,
        id BIGINT NOT NULL UNIQUE
    );
    INSERT INTO tmp_seed_orders (id)
    SELECT id FROM orders WHERE order_code LIKE 'SEED-2026-%' ORDER BY id;

    SET v_i = 1;
    WHILE v_i <= 120 DO
        SELECT id INTO v_order_id
        FROM tmp_seed_orders
        WHERE seq = IF(v_i <= 80, v_i, v_i - 80);

        SET v_product_seq = CASE
            WHEN v_i <= 80 THEN MOD(v_i * 7 - 1, 30) + 1
            ELSE MOD((v_i - 80) * 7 + 10, 30) + 1
        END;
        SET v_variant_sort = MOD(v_i - 1, 3) + 1;

        SELECT p.id, p.name, pv.id, pv.sale_price,
               CONCAT_WS(' · ', f.name, s.name)
        INTO v_product_id, v_product_name, v_variant_id, v_unit_price, v_variant_name
        FROM tmp_seed_products sp
        JOIN products p ON p.id = sp.id
        JOIN product_variants pv ON pv.product_id = p.id AND pv.sort_order = v_variant_sort
        LEFT JOIN flavors f ON f.id = pv.flavor_id
        LEFT JOIN sizes s ON s.id = pv.size_id
        WHERE sp.seq = v_product_seq
        LIMIT 1;

        INSERT INTO order_items
            (order_id, product_id, variant_id, product_name, variant_name,
             unit_price, quantity, subtotal)
        VALUES
            (v_order_id, v_product_id, v_variant_id, v_product_name, v_variant_name,
             v_unit_price, 1 + MOD(v_i, 3), v_unit_price * (1 + MOD(v_i, 3)));

        SET v_i = v_i + 1;
    END WHILE;

    UPDATE orders o
    JOIN (
        SELECT order_id, SUM(subtotal) AS item_total
        FROM order_items
        GROUP BY order_id
    ) x ON x.order_id = o.id
    SET o.subtotal = x.item_total
    WHERE o.order_code LIKE 'SEED-2026-%';

    UPDATE orders o
    LEFT JOIN promotions p ON p.id = o.promotion_id
    SET o.discount_amount = CASE
        WHEN p.id IS NULL THEN 0
        WHEN p.type = 'PERCENT' THEN LEAST(o.subtotal, ROUND(o.subtotal * p.value / 100, 0))
        ELSE LEAST(o.subtotal, p.value)
    END,
    o.shipping_fee = CASE WHEN p.free_shipping = TRUE THEN 0 ELSE o.shipping_fee END
    WHERE o.order_code LIKE 'SEED-2026-%';

    UPDATE orders
    SET total_amount = GREATEST(0, subtotal - discount_amount + shipping_fee)
    WHERE order_code LIKE 'SEED-2026-%';

    -- Mỗi đơn có một bản ghi thanh toán tương ứng.
    SET v_i = 1;
    WHILE v_i <= 80 DO
        SELECT o.id, o.status, o.payment_status, o.total_amount, o.created_at
        INTO v_order_id, v_order_status, v_payment_status, v_total_amount, v_created_at
        FROM orders o
        JOIN tmp_seed_orders so ON so.id = o.id
        WHERE so.seq = v_i;

        SET v_payment_method = ELT(MOD(v_i - 1, 4) + 1, 'COD','VNPAY','MOMO','BANK_TRANSFER');
        SET v_payment_record_status = CASE
            WHEN v_payment_status = 'PAID' THEN 'SUCCESS'
            WHEN v_payment_status = 'REFUNDED' THEN 'REFUNDED'
            WHEN v_order_status = 'CANCELLED' THEN 'FAILED'
            ELSE 'PENDING'
        END;

        INSERT INTO payments
            (order_id, method, status, amount, transaction_id, paid_at, note, created_at)
        VALUES
            (v_order_id, v_payment_method, v_payment_record_status, v_total_amount,
             IF(v_payment_method='COD', NULL, CONCAT('SEED-TXN-', DATE_FORMAT(v_created_at, '%Y%m%d'), '-', LPAD(v_i, 5, '0'))),
             IF(v_payment_record_status IN ('SUCCESS','REFUNDED'), DATE_ADD(v_created_at, INTERVAL 2 HOUR), NULL),
             CASE v_payment_method
                 WHEN 'COD' THEN 'Thanh toán tiền mặt khi nhận hàng'
                 WHEN 'VNPAY' THEN 'Thanh toán qua cổng VNPay sandbox'
                 WHEN 'MOMO' THEN 'Chuyển khoản ví điện tử MoMo'
                 ELSE 'Chuyển khoản ngân hàng qua mã QR'
             END,
             v_created_at);

        SET v_i = v_i + 1;
    END WHILE;

    INSERT INTO promotion_usages (promotion_id, user_id, order_id, used_at)
    SELECT promotion_id, user_id, id, created_at
    FROM orders
    WHERE order_code LIKE 'SEED-2026-%' AND promotion_id IS NOT NULL;

    UPDATE promotions p
    SET p.used_count = (
        SELECT COUNT(*) FROM promotion_usages pu WHERE pu.promotion_id = p.id
    )
    WHERE p.code LIKE 'SEED_%';

    -- --------------------------------------------------------
    -- 6. 60 ĐÁNH GIÁ TỪ CÁC ĐƠN ĐÃ GIAO
    -- --------------------------------------------------------
    INSERT INTO reviews
        (product_id, user_id, order_id, rating, comment, image_url,
         is_approved, reply, replied_at, product_name, created_at)
    SELECT product_id, user_id, order_id,
           CASE MOD(rn, 10) WHEN 0 THEN 3 WHEN 1 THEN 4 ELSE 5 END,
           CASE MOD(rn, 8)
               WHEN 0 THEN 'Nước ép tươi, vị tự nhiên và đóng gói rất chắc chắn.'
               WHEN 1 THEN 'Giao đúng giờ, sản phẩm còn lạnh và hạn sử dụng mới.'
               WHEN 2 THEN 'Vị vừa miệng, không quá ngọt. Mình sẽ đặt lại.'
               WHEN 3 THEN 'Thành phần rõ ràng, phù hợp bữa sáng ở văn phòng.'
               WHEN 4 THEN 'Chất lượng ổn định, chai đẹp và nhân viên hỗ trợ nhiệt tình.'
               WHEN 5 THEN 'Mùi vị thơm, cảm nhận được nguyên liệu tươi.'
               WHEN 6 THEN 'Combo tiện lợi, khẩu phần hợp lý và giao hàng nhanh.'
               ELSE 'Sản phẩm ngon, đúng mô tả; mong shop có thêm nhiều lựa chọn.'
           END,
           IF(MOD(rn, 6)=0,
              CONCAT('https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=75&sig=', rn),
              NULL),
           IF(MOD(rn, 17)=0, FALSE, TRUE),
           IF(MOD(rn, 3)=0,
              'Green Juice Hub cảm ơn bạn đã tin tưởng. Shop rất vui khi sản phẩm phù hợp với bạn!',
              NULL),
           IF(MOD(rn, 3)=0, DATE_ADD(order_created_at, INTERVAL 6 DAY), NULL),
           product_name,
           DATE_ADD(order_created_at, INTERVAL 4 DAY)
    FROM (
        SELECT oi.product_id, o.user_id, o.id AS order_id, oi.product_name,
               o.created_at AS order_created_at,
               ROW_NUMBER() OVER (ORDER BY o.id, oi.id) AS rn
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.order_code LIKE 'SEED-2026-%'
          AND o.status = 'DELIVERED'
    ) eligible_reviews
    WHERE rn <= 60;

    UPDATE products p
    LEFT JOIN (
        SELECT product_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
        GROUP BY product_id
    ) r ON r.product_id = p.id
    SET p.avg_rating = COALESCE(r.avg_rating, 0),
        p.review_count = COALESCE(r.review_count, 0)
    WHERE p.slug LIKE 'seed-%';

    -- --------------------------------------------------------
    -- 7. 46 YÊU CẦU LIÊN HỆ
    -- --------------------------------------------------------
    SET v_i = 1;
    WHILE v_i <= 46 DO
        SET v_name = CONCAT(
            ELT(MOD(v_i - 1, 8) + 1, 'Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Vũ','Đặng'),
            ' ',
            ELT(MOD(v_i * 5 - 1, 12) + 1,
                'Minh Anh','Quang Huy','Thảo Vy','Gia Bảo','Ngọc Hà','Hoàng Nam',
                'Khánh Linh','Tuấn Kiệt','Phương Nhi','Đức Anh','Bảo Trâm','Thu Trang'));

        INSERT INTO contacts
            (full_name, email, phone, subject, message, status,
             reply, replied_at, replied_by_name, created_at)
        VALUES
            (v_name,
             CONCAT('khachhang', LPAD(v_i, 3, '0'), '@example.com'),
             CONCAT('08', LPAD(20000000 + v_i, 8, '0')),
             ELT(MOD(v_i - 1, 7) + 1,
                 'Tư vấn liệu trình detox 3 ngày',
                 'Thay đổi thời gian giao hàng',
                 'Thông tin thành phần và calorie',
                 'Hợp tác cung cấp cho văn phòng',
                 'Góp ý về bao bì sản phẩm',
                 'Hỏi về chính sách đổi trả',
                 'Đăng ký đơn hàng định kỳ'),
             ELT(MOD(v_i - 1, 7) + 1,
                 'Mình muốn được tư vấn combo detox phù hợp cho người mới bắt đầu.',
                 'Mình cần đổi khung giờ giao sang buổi chiều, shop hỗ trợ giúp nhé.',
                 'Cho mình xin bảng thành phần dinh dưỡng và lượng đường trong sản phẩm.',
                 'Công ty mình cần đặt khoảng 40 chai mỗi tuần, mong nhận báo giá.',
                 'Bao bì đẹp nhưng mình mong shop có chương trình thu hồi chai cũ.',
                 'Nếu sản phẩm bị ảnh hưởng trong quá trình giao thì đổi trả thế nào?',
                 'Mình muốn giao định kỳ vào sáng thứ Hai, Tư và Sáu hàng tuần.'),
             ELT(MOD(v_i - 1, 3) + 1, 'NEW','IN_PROGRESS','RESOLVED'),
             IF(MOD(v_i - 1, 3) = 2,
                'Cảm ơn bạn đã liên hệ. Green Juice Hub đã ghi nhận và gửi thông tin chi tiết qua email.',
                NULL),
             IF(MOD(v_i - 1, 3) = 2, DATE_SUB(NOW(), INTERVAL MOD(v_i, 12) DAY), NULL),
             IF(MOD(v_i - 1, 3) = 2, 'Nguyễn Minh - CSKH', NULL),
             DATE_SUB(NOW(), INTERVAL (47 - v_i) DAY));

        SET v_i = v_i + 1;
    END WHILE;

    -- --------------------------------------------------------
    -- 8. CHÍNH SÁCH VÀ BANNER
    -- --------------------------------------------------------
    INSERT INTO shipping_policies (type, title, content, sort_order, is_active)
    VALUES
        ('SHIPPING', 'Chính sách giao hàng',
         '<h2>Phạm vi giao hàng</h2><p>Green Juice Hub giao hàng tại TP.HCM, ưu tiên sản phẩm lạnh trong bán kính phù hợp.</p><h2>Thời gian</h2><ul><li>Đơn trước 10:00: giao trong ngày.</li><li>Đơn sau 10:00: giao trong 24 giờ.</li><li>Nhân viên gọi trước khi giao từ 5–10 phút.</li></ul><h2>Bảo quản</h2><p>Sản phẩm được vận chuyển trong túi giữ nhiệt và cần bảo quản lạnh ngay khi nhận.</p>',
         1, TRUE),
        ('RETURN', 'Chính sách đổi trả',
         '<h2>Điều kiện đổi sản phẩm</h2><p>Hỗ trợ đổi trong vòng 4 giờ kể từ khi nhận nếu sản phẩm giao sai, rò rỉ, mất niêm phong hoặc không đảm bảo nhiệt độ.</p><h2>Quy trình</h2><ol><li>Chụp ảnh sản phẩm và mã đơn.</li><li>Liên hệ CSKH qua trang Liên hệ.</li><li>Shop xác nhận và giao bù hoặc hoàn tiền.</li></ol>',
         2, TRUE),
        ('WARRANTY', 'Cam kết chất lượng',
         '<h2>Cam kết tươi mới</h2><p>Nước ép được sản xuất trong ngày, không chất bảo quản và có hạn dùng rõ ràng trên nhãn.</p><h2>Nguồn nguyên liệu</h2><p>Nguyên liệu được kiểm tra cảm quan, sơ chế theo quy trình vệ sinh và lưu mẫu theo từng mẻ.</p>',
         3, TRUE),
        ('TERMS', 'Điều khoản sử dụng',
         '<h2>Thông tin đặt hàng</h2><p>Khách hàng chịu trách nhiệm cung cấp số điện thoại và địa chỉ chính xác.</p><h2>Thanh toán</h2><p>Đơn trực tuyến chỉ được xác nhận sau khi hệ thống ghi nhận giao dịch thành công. Các chương trình ưu đãi không quy đổi thành tiền mặt.</p>',
         4, TRUE);

    INSERT INTO banners
        (title, description, image_url, link_url, sort_order, is_active)
    VALUES
        ('Khởi động ngày xanh', 'Nước ép lạnh nguyên chất, giao nhanh trong ngày.', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1600&q=85', '/products?category=seed-nuoc-ep-nguyen-chat', 1, TRUE),
        ('Detox nhẹ nhàng mỗi ngày', 'Bộ công thức rau củ cân bằng dành cho người mới.', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=1600&q=85', '/products?category=seed-nuoc-ep-detox', 2, TRUE),
        ('Smoothie no lâu, khỏe lâu', 'Bữa phụ giàu chất xơ và chất béo tốt.', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1600&q=85', '/products?category=seed-smoothie-dinh-duong', 3, TRUE),
        ('Sữa chua Hy Lạp thủ công', 'Giàu protein, ít đường, lọc chậm 12 giờ.', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1600&q=85', '/products?category=seed-sua-chua-hy-lap', 4, TRUE),
        ('Granola giòn thơm', 'Yến mạch và hạt nướng chậm cho bữa sáng đủ chất.', 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1600&q=85', '/products?category=seed-granola-an-nhe', 5, TRUE),
        ('Ưu đãi khách hàng mới', 'Giảm 50.000đ cho đơn đầu tiên từ 299.000đ.', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1600&q=85', '/products', 6, TRUE),
        ('Combo văn phòng khỏe mạnh', 'Đặt theo tuần, giao đúng khung giờ làm việc.', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1600&q=85', '/contact', 7, TRUE),
        ('Thu chai cũ - thêm mầm xanh', 'Cùng Green Juice Hub giảm rác thải nhựa.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=85', '/policies/SHIPPING', 8, FALSE);

    COMMIT;

    SELECT 'Seed dữ liệu Green Juice Hub thành công.' AS message;
END seed_main$$

DELIMITER ;

CALL seed_green_juice_hub();
DROP PROCEDURE IF EXISTS seed_green_juice_hub;
