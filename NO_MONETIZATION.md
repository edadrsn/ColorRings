# Reklam ve uygulama içi satın alma kaldırıldı — 28 Ekim 2026

Reklam simülatörü, ödüllü reklam ve bölüm arası reklam planlayıcısı; satın alma servisleri, test makbuzları, geri yükleme ekranları, altın paketleri ve Premium paketleri kaldırıldı. Bu sistemlerin modülleri, arayüzleri, kullanılmayan görselleri, stilleri ve çevirileri de temizlendi. Bölüm sonundaki devam düğmesi doğrudan sonraki bölümü açar.

Mağazada sadece oyunda kazanılan altınla açılabilen top görünümleri, temalar ve renk paletleri var. Prism / Orbit / Royal görünümleri sırasıyla 320 / 340 / 360 altın; Prism / Velvet temaları 260 / 280 altın oldu. Daha önce açılmış olanlar tekrar ücretlendirilmez. Başarımla açılan görünümlerin koşulları değişmedi.

Kayıt anahtarı korunur. Tamamlanan bölümler, yıldızlar, altın, ayarlar ve seçili kozmetikler korunur. Eski kullanılmamış ipucu kredileri bağımsız oyun verisine taşınır. Yeni kayıtta ürün, makbuz, reklam hakkı veya Premium durumu bulunmaz. Emekliye ayrılmış yerel test makbuzu anahtarı, tarayıcı izin verirse silinir; asıl ilerleme kaydı silinmez. Sandbox temizliği sadece kendi kayıt alanına uygulanır.

Doğrulama:

- Tam test paketi: **763 geçti, 0 hata**. Kaldırılan reklam/satın alma testlerinin yerine kayıt taşıma, altınla kozmetik açma, aynı kozmetiğe ikinci kez ücret almama ve arayüzde eski sistemlerin bulunmaması testleri eklendi.
- Son katalog temizliğinden sonra 19 ilgili test tekrar geçti.
- TypeScript ve production build başarılı. Mevcut Phaser büyük paket uyarısı sürüyor.
- Gerçek tarayıcıda mağaza → koleksiyon → görünüm → geri ve temalar yolları kontrol edildi. Eski Prism / Royal / Velvet sahipliği korunuyor. Yetersiz altınla Neon alma denemesi bakiyeyi değiştirmedi.
- Sandbox profilde birinci bölüm fizik simülasyonuyla tamamlandı ve Next Level doğrudan ikinci bölümü açtı. Tarayıcı hata günlüğü boş.
- Mobil mağaza 390×844 boyutunda kontrol edildi. Fizik ve bölüm verileri değiştirilmedi.

Önceki tarihli tasarım raporları ve ekran görüntüleri geçmiş sürümlerin arşividir; güncel oyun özelliklerini tarif etmez.
