# Finance Tracker

Kişisel gelir ve giderlerinizi tarayıcı üzerinden takip etmenizi sağlayan basit bir finans paneli. Uygulama; işlem ekleme, kategori bazlı filtreleme, bütçe tanımlama, bütçe aşımı uyarısı ve grafiklerle özet görüntüleme özellikleri sunar.

## Özellikler

- Gelir ve gider işlemi ekleme
- İşlem silme
- Kategori bazlı listeleme
- Gelişmiş filtreleme
- Tutar aralığı, işlem türü, tarih ve kategori filtresi
- Kategoriye göre bütçe belirleme
- Bütçe aşımı durumunda uyarı gösterimi
- Gelir/gider dağılımı için pasta grafik
- Bütçe ve harcama karşılaştırması için bar grafik
- Karanlık mod desteği
- Verilerin `localStorage` ile tarayıcıda saklanması

## Kullanılan Teknolojiler

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- [Tailwind CSS](https://tailwindcss.com/) CDN
- [Chart.js](https://www.chartjs.org/) CDN
- `localStorage`

## Ekranlar ve Akış

Uygulama tek sayfadan oluşur ve şu ana bölümleri içerir:

- Üst alan: karanlık mod anahtarı ve yeni işlem ekleme butonu
- İşlem listesi: kayıtlı işlemleri görüntüleme ve silme
- Filtreleme modalı: fiyat, tür, tarih ve kategori filtresi
- Bütçe yönetimi: kategoriye göre bütçe tanımlama
- Özet kartları: kategori bazlı bütçe / harcama ilerlemesi
- Grafik alanı: toplam gelir, toplam gider, net gelir ve grafikler

## Kurulum

Bu proje için ek bir kurulum veya paket yöneticisi gerekmez.

1. Repoyu klonlayın:

```bash
git clone https://github.com/MesutYilmazJS/finance-tracker.git
```

2. Proje klasörüne girin:

```bash
cd finance-tracker
```

3. `index.html` dosyasını tarayıcıda açın.

Alternatif olarak bir canlı sunucu ile de çalıştırabilirsiniz. Örneğin VS Code içinde `Live Server` eklentisi kullanılabilir.

## Kullanım

1. `+ Yeni İşlem Ekle` butonu ile yeni gelir veya gider kaydı oluşturun.
2. İşlem eklerken açıklama, tutar, tarih, kategori ve işlem türü seçin.
3. İşlem listesini kategori seçimi veya filtre modalı ile daraltın.
4. Bütçe yönetimi alanından kategori bazlı bütçe tanımlayın.
5. Harcama bütçeyi aşarsa ekranda uyarı görüntülenir.
6. Grafiklerden toplam gelir/gider ve bütçe performansını takip edin.

## Veri Saklama

Uygulama verileri tarayıcıdaki `localStorage` içinde saklanır:

- `transactions`: gelir ve gider kayıtları
- `budgets`: kategori bazlı bütçeler
- `darkMode`: tema tercihi

Bu nedenle veriler aynı tarayıcıda korunur; farklı cihazlarda veya farklı tarayıcılarda otomatik olarak senkronize edilmez.

## Proje Yapısı

```text
finance-tracker/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Geliştirme Notları

- Uygulama tamamen istemci tarafında çalışır.
- Herhangi bir backend veya veritabanı bağlantısı yoktur.
- Harici kütüphaneler CDN üzerinden yüklenir.

## İyileştirme Fikirleri

- İşlem düzenleme özelliği
- Daha fazla kategori desteği
- Aylık / haftalık rapor ekranları
- Dışa aktarma (`CSV`, `PDF`) desteği
- Çoklu para birimi desteği
- Kalıcı kullanıcı hesabı ve bulut senkronizasyonu

## Lisans

Bu proje için henüz bir lisans dosyası tanımlanmamıştır. Gerekirse `LICENSE` dosyası eklenerek açıkça belirtilebilir.
