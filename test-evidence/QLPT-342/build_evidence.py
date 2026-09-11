"""Build a readable evidence report from actual Maven/MockMvc output."""
from pathlib import Path
import html
import json
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[2]
out = Path(__file__).resolve().parent
log = (root / 'backend/target/qlpt-342-evidence-run.log').read_text(encoding='utf-8', errors='replace')
assert 'BUILD SUCCESS' in log, 'Run Maven tests successfully before generating evidence'
summary = re.findall(r'Tests run: \d+, Failures: \d+, Errors: \d+, Skipped: \d+', log)[-1]
finished = re.search(r'Finished at: (.+)', log).group(1)
cart = ET.parse(root / 'backend/target/surefire-reports/TEST-com.greenjuicehub.backend.controller.CartControllerMockMvcIntegrationTest.xml').getroot()
assert cart.attrib['failures'] == '0' and cart.attrib['errors'] == '0'
css = '''body{margin:0;background:#edf2f7;color:#18283a;font:18px Arial,sans-serif}main{max-width:1100px;margin:30px auto;background:white;padding:32px;border-radius:16px}h1{font-size:28px;margin:12px 0}h2{font-size:21px}pre{background:#142336;color:#edf6ff;padding:20px;border-radius:9px;white-space:pre-wrap;font:17px Consolas,monospace;line-height:1.5}.tag{color:#087443;font-weight:bold}.note{background:#fff4dc;padding:16px;line-height:1.5}small{color:#52677c}li{margin:10px 0}a{margin-right:20px}'''
def page(name, title, content):
    (out / name).write_text(f'<!doctype html><meta charset="utf-8"><title>{title}</title><style>{css}</style><main><small>QLPT-342 • BUG-CART-001 • Nhánh huytran • {html.escape(finished)}</small><h1>{title}</h1>{content}<p class="note">Phạm vi: Spring MockMvc, CUSTOMER principal giả lập, ICartService được mock. Đây không phải ảnh Postman hoặc kiểm thử với database seed. Backend local bị chặn bởi lỗi đăng nhập MySQL; chưa xác minh GET cart / stock trên DB.</p><nav><a href="post.html">POST</a><a href="put.html">PUT</a><a href="summary.html">Tổng kết</a></nav></main>', encoding='utf-8')
evidence = []
for method, name in [('POST', 'post.html'), ('PUT', 'put.html')]:
    matches = []
    for chunk in log.split('MockHttpServletRequest:')[1:]:
        if f'HTTP Method = {method}' not in chunk:
            continue
        bodies = re.findall(r'^\s*Body = (.+)$', chunk, re.M)
        if len(bodies) >= 2 and json.loads(bodies[0]).get('quantity') == 1.5:
            matches.append((chunk, bodies))
    assert len(matches) == 1
    chunk, bodies = matches[0]
    uri = re.search(r'Request URI = (.+)', chunk).group(1)
    status = int(re.search(r'^\s*Status = (\d+)', chunk, re.M).group(1))
    assert status == 400
    # Raw response bytes preserve UTF-8; MockMvc console printing can lose accents on Windows.
    response = json.loads((root / f'backend/target/cart-{method.lower()}-1.5.json').read_text(encoding='utf-8'))
    item = dict(method=method, uri=uri, request=json.loads(bodies[0]), status=status, response=response,
                serviceVerification='verifyNoInteractions(cartService) passed')
    evidence.append(item)
    pretty = lambda obj: html.escape(json.dumps(obj, ensure_ascii=False, indent=2))
    page(name, f'{method} quantity = 1.5 → HTTP 400', f'<p class="tag">PASS — từ chối số thập phân</p><h2>Request • {method} {uri}</h2><pre>{pretty(item["request"])}</pre><h2>Response thực tế • HTTP {status}</h2><pre>{pretty(response)}</pre><p class="tag">PASS — verifyNoInteractions(cartService)</p><p>Request bị từ chối trước khi gọi service giỏ hàng.</p>')
(out / 'api-evidence.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding='utf-8')
(out / 'test-summary.txt').write_text(f'{finished}\n{summary}\nBUILD SUCCESS\nCart controller: {cart.attrib["tests"]} tests; 0 failures; 0 errors\n', encoding='utf-8')
page('summary.html', 'Kết quả regression test', f'<p class="tag">BUILD SUCCESS</p><pre>{html.escape(summary)}\nCart controller: {cart.attrib["tests"]} tests; 0 failures; 0 errors</pre><ul><li>POST và PUT: 1.5, 1.0, 1e0, 0.5, -1.5 đều trả 400.</li><li>Request thập phân: không tương tác với cartService.</li><li>PUT quantity = 1 và 10: HTTP 200, chuyển đúng số lượng vào service.</li><li>PUT quantity = 0, -1, null: HTTP 400.</li></ul><h2>Lệnh kiểm tra</h2><pre>.\\mvnw.cmd "-Dcart.evidence=true" test</pre>')
(out / 'README.md').write_text(f'''# QLPT-342 / BUG-CART-001 — minh chứng regression

- Thời điểm: {finished}; nhánh huytran, bản sửa chưa commit.
- {summary}. BUILD SUCCESS.
- POST /api/cart/items với productId=13, variantId=37, quantity=1.5: HTTP 400.
- PUT /api/cart/items/7 với quantity=1.5: HTTP 400.
- Cả hai kiểm tra verifyNoInteractions(cartService) đều đạt.
- File api-evidence.json chứa request/response lấy từ output MockMvc thực tế.
- PNG là ảnh chụp báo cáo HTML được dựng từ kết quả test, không phải ảnh Postman.
- Giới hạn: mock CUSTOMER principal và ICartService; không kiểm tra JWT login hoặc dữ liệu seed. Backend local không khởi động được do MySQL Access denied; chưa xác minh GET cart / tồn kho DB.
- 2 test bị skip thuộc bộ test hiện có; không phải toàn bộ test đều được chạy.

Chạy lại trong backend: `.\\mvnw.cmd "-Dcart.evidence=true" test`
Sau đó chạy `build_evidence.py` để cập nhật báo cáo từ log backend/target/qlpt-342-evidence-run.log.
''', encoding='utf-8')
print(summary)
