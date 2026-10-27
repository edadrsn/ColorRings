# Seçilen sekiz bölümün yeniden tasarımı

Kaynak: `requested-redesigns.ts`. Yalnız **K03, K09, K29, K36, K39, K40, U004 ve U006** değiştirilir; fabrika diğer 132 düzene yazmaz. Yeni yakalanan PNG dosyaları önceki 140 görselle SHA-256 üzerinden karşılaştırıldı: tam bu sekiz dosya farklı, diğer **132 PNG aynı**. İlerleme kimlikleri, oyuncunun altını ve satın almaları korunur.

| Kod | Yeni düzen | Çözüm fikri |
| --- | --- | --- |
| U004 | 2 halka; bir top merkezde, diğeri dış koridorda | Önce merkezdeki pembe, sonra dıştaki mavi |
| U006 | 3 halka; orta ve dış halka ters bağlı | Bağlantıyı dengele, önce mavi sonra pembe |
| K03 | 3 halka, iki ayrı dış pencere | İki çıkışı farklı kovalarla hizala |
| K09 | 4 halka, 4 top, birinci/üçüncü halka ters bağlı | İki mavi ve ardından iki pembe dalga |
| K29 | 2 halka, 3 koridor, 2 hareketli engel | Yan toplar dış katta; ortadaki sarı içten geçer |
| K36 | 4 halka, 6 top, iki anahtar ve tek yön | Dış ceplerin topları iç kapıları açar |
| K39 | 4 halka, 3 başlangıç rengi; dönen anahtar, bağlı çark, boya geçidi ve bölücü | Sarı mora dönüşür, mavi çoğalır; 4 hedef top |
| K40 | 3 halka, 4 renk, dönmesi kilitli dış halka, 2 bölücü | Anahtardan sonra pembe/mavi/yeşil/mor sırasıyla 6 teslim |

Her yeni çözüm gerçek RingSession hamleleriyle tanımlanır. Üç yıldız hedefi planın hamle sayısını kullanır; finalde küresel ve halka bazlı bütçe de uygulanır. Klasik 3'ün öğreticisi artık üçüncü halkayı da bekler.

Eski iki halkalı Klasik 3 artık oyunda bulunmadığından, ceplerde top tutma / ters teslim sırası / klasik Undo fizik regresyonları ayrı `tests/legacy-sequence.ts` test fikstürüne taşındı. Yeni Klasik 3 hem genel tüm-bölüm testlerinde hem yeni özel testlerde gerçek oyun bölümü olarak doğrulanır. Kare hızı testi, final gibi çok aşamalı seviyeleri tek sabit açıyla çalıştırmak yerine sertifikalı komutları aynı fizik adımlarında uygular.

Görseller: `review-captures/focus.png` sekizli özet; `review-captures/bolumler/` tam boy yeni PNG'ler; dört ilgili karşılaştırma sayfası ve statik galeri yenilendi. Arşiv tüm 140 güncel bölüm, 14 sayfa ve yeni özeti içerir. `review.html?focus=U4,U6,K3,K9,K29,K36,K39,K40` aynı normal Phaser sahnesinden bu seçkiyi yeniden oluşturur; görüntü oluşturma sayfası kayıt yazmaz.

Her sekiz bölüm için sabit fizik anlarındaki aynı girişlerin 1× / 2× son top durumları eşit kontrol edildi. Anahtar, renk dönüşümü, bölünmüş top sayıları, bağlı halkada Undo/Restart, finalin anahtar kilidi ve öğreticide üçüncü halka ayrıca test edilir. Gerçek cihaz FPS veya tüm seviyelerin elle oynandığı iddia edilmez. Son tam komut çıktıları `requested-final-tests.log`, `requested-validation.log` içindedir.
