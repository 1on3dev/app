// Buka / buat database
const request = indexedDB.open('jadwalDB', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains('jadwal')) {
    db.createObjectStore('jadwal', { keyPath: 'id' });
  }
};

request.onsuccess = function(event) {
  const db = event.target.result;
  console.log('Database terbuka ✅');

  // Ambil JSON dan simpan ke IndexedDB
  fetch('json/jadwal.json')
    .then(res => res.json())
    .then(data => {
      const tx = db.transaction('jadwal', 'readwrite');
      const store = tx.objectStore('jadwal');

      data.forEach(item => store.put(item));

      tx.oncomplete = () => {
        console.log('Jadwal berhasil disimpan ke IndexedDB ✅');
        // Setelah data masuk, mulai cek reminder
        startReminder(db);
      };
      tx.onerror = (e) => console.error('Error menyimpan jadwal', e);
    })
    .catch(err => console.error('Gagal load jadwal.json', err));
};

request.onerror = function(event) {
  console.error('Gagal membuka database', event);
};

// ================= Fungsi Reminder =================
function startReminder(db) {
  // Minta izin notifikasi
  if (!('Notification' in window)) {
    alert('Browser tidak mendukung notifikasi');
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') {
      alert('Notifikasi tidak diizinkan ❌');
      return;
    }

    // Cek jadwal tiap 30 detik
    setInterval(() => checkJadwal(db), 30 * 1000);
  });
}

// ================= Fungsi Cek Jadwal =================
function checkJadwal(db) {
  const tx = db.transaction('jadwal', 'readwrite');
  const store = tx.objectStore('jadwal');

  const getAllRequest = store.getAll();
  getAllRequest.onsuccess = function() {
    const allJadwal = getAllRequest.result;
    const now = Date.now();

    allJadwal.forEach(j => {
      // Jika waktunya sudah lewat dan belum diberi notifikasi
      if (j.time <= now && !j.notified) {
        // Tampilkan notifikasi
        new Notification(j.title, {
          body: 'Waktunya!',
          icon: 'icons/icon-72x72.png'
        });

        // Tandai sudah diberi notifikasi
        j.notified = true;
        store.put(j);
      }
    });
  };

  getAllRequest.onerror = function(e) {
    console.error('Gagal membaca jadwal dari IndexedDB', e);
  };
}
