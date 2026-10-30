# Müzik ve dil güncellemesi — 28 Ekim 2026

Arka plandaki dört notalık döngü, 48 saniyelik akor/melodi çevrimi olan özgün ve sakin bir parçayla değiştirildi. Yumuşak akorlar, hafif bas ve değişen melodi Web Audio ile yerel olarak üretilir. Ses dosyası indirilmez. Ses efektleri ve müzik bağımsız açılıp kapanır; sekme gizlenince müzik durur. En fazla sekiz ses, müzik için en fazla dört ses sınırı korunur.

Ayarlar → Dil: Türkçe, English, Deutsch, Español, Français, Português. Seçim anında uygulanır; yeniden yüklemede korunur. Tercih, `spin-sort-language-v1` anahtarında tutulur; ilerleme, satın alma kayıtları ve altın değiştirilmez. Sandbox tercihi de kendi alanında saklanır. Depolama engellenirse dil oturum boyunca uygulanır ve kullanıcıya bildirilir.

Menüler, öğretici, 140 bölüm adı, Ustalık başlıkları, hedefler, kontrol etiketleri, ödül ekranı ve koleksiyon açıklamaları için yerel çeviri kataloğu eklendi. Özgün İngilizce materyal/ürün adları korunur. Bölüm yardım metinleri diğer dillerde gerçek hedef ve mekanik verilerinden üretilir; çözüm veya fizik değiştirilmez. Katalogda bulunmayan yeni metinler kaynak metne döner. Geliştirici performans raporları ve bazı nadir test simülatörü teşhisleri kaynak dilde kalabilir.

Mevcut DOM elemanları ve olay işleyicileri korunur. Dil değiştirmek sahneyi veya denemeyi yeniden başlatmaz. Çeviriler yalnız değişen DOM düğümlerine uygulanır; kare başına bütün sayfa taranmaz. Başlıklar ve erişilebilirlik etiketleri de güncellenir; `html.lang` seçilen dile eşitlenir.

## Doğrulama

- `npm test`: 773 test geçti, 0 hata. Dokuz yeni test; katalog bütünlüğü, tüm bölüm başlıkları, dil kayıt izolasyonu, engelli depolama, dinamik sayılar, DOM dil değiştirme, kurallardan üretilen yardım, müzik çeşitliliği ve müziğin efektlerden bağımsız durması.
- `npm run build`: TypeScript ve Vite production build başarılı. Mevcut Phaser büyük paket uyarısı sürüyor.
- Gerçek tarayıcıda altı dil arasında geçiş; 320×568 ekranda ayarlar, sayfa ve oyun kontrol butonlarında yatay taşma yok. Uzun Almanca/French kontrol etiketleri kısaltıldı.
- İngilizce ve müzik seçimi sayfa yenilendikten sonra korundu; “Sesi dene” gerçek Web Audio başlatma başarısı bildirdi. Otomatik kontrol sesin kullanıcı tarafından işitilmesini değerlendirmez.
- Sandbox profilde İngilizce gerçek bölüm 1 tamamlandı; Next Level ile bölüm 2 açıldı; Undo bir hamleyi geri aldı, harcanan hamle sayısı korundu; Restart sayacı sıfırladı.
- Fiziksel telefon ve insan tarafından çok dilli redaksiyon yapılmadı. Tarayıcı boyut denemeleri fiziksel cihaz performans sertifikası değildir.

Oyun: http://localhost:5173/
