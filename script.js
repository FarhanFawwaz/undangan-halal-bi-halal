document.addEventListener('DOMContentLoaded', () => {
    // Paksa agar selalu mulai dari atas saat di-refresh (mengatasi nyangkut jika di-refresh di tengah jalan)
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 0. Lock Scroll Awal
    document.documentElement.classList.add('locked');
    document.body.classList.add('locked');

    // Mencegah scroll di drag secara paksa di HP (touchmove blocker)
    const preventScroll = (e) => {
        e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });

    const scriptURL = "https://script.google.com/macros/s/AKfycbw-9wW3TZx-v6oJog0D3FB8Wuc6S3Uar9ZEHht2Z3cOG1YdSqepFSpAkLxEduLiNdnLOw/exec";
    // 1. Initialize AOS (Animate on Scroll)
    AOS.init({
        once: true,
        offset: 50,
        duration: 800,
        easing: 'ease-in-out'
    });

    // 2. Countdown Timer Logic
    const countdown = () => {
        // Set event date: March 24, 2026, 08:00:00 WIB
        const eventDate = new Date("March 24, 2026 08:00:00").getTime();
        const now = new Date().getTime();

        const gap = eventDate - now;

        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        if (gap > 0) {
            const d = Math.floor(gap / day);
            const h = Math.floor((gap % day) / hour);
            const m = Math.floor((gap % hour) / minute);
            const s = Math.floor((gap % minute) / second);

            document.getElementById('days').innerText = d < 10 ? '0' + d : d;
            document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
            document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
            document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
        } else {
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
        }
    };
    setInterval(countdown, 1000);
    countdown();

    // 3. RSVP Form Handling (Google Sheets Integration)
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpMessage = document.getElementById('rsvpMessage');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = rsvpForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Mengirim Data...";
            btn.disabled = true;

            // Gather Data from Form
            const urlEncodedData = new URLSearchParams();
            urlEncodedData.append('nama', document.getElementById('nama').value);
            urlEncodedData.append('dewasa', document.getElementById('dewasa').value);
            urlEncodedData.append('anak', document.getElementById('anak').value);
            urlEncodedData.append('status', document.getElementById('status').value);

            // Send to Google Sheets via fetch
            fetch(scriptURL, { method: 'POST', body: urlEncodedData, mode: 'no-cors' })
                .then(response => {
                    rsvpMessage.style.color = "var(--primary-color)";
                    rsvpMessage.innerText = "Terima kasih! Konfirmasi Anda telah tercatat.";
                    rsvpForm.reset();
                    btn.innerText = originalText;
                    btn.disabled = false;
                    setTimeout(() => rsvpMessage.innerText = "", 5000);
                })
                .catch(error => {
                    rsvpMessage.style.color = "red";
                    rsvpMessage.innerText = "Maaf, terjadi kesalahan jaringan. Silakan coba lagi.";
                    console.error('Error!', error.message);
                    btn.innerText = originalText;
                    btn.disabled = false;
                });
        });
    }

    // 4. Guestbook Form Handling with Google Sheets
    const guestbookForm = document.getElementById('guestbookForm');
    const messagesList = document.getElementById('messagesList');

    // Fungsi untuk memuat pesan dari Google Sheets via GET request
    const loadMessages = () => {
        if (!messagesList) return;

        // Tampilkan status loading
        messagesList.innerHTML = '<div class="msg-bubble"><p><em>Memuat pesan buku tamu...</em></p></div>';

        fetch(scriptURL)
            .then(res => res.json())
            .then(data => {
                messagesList.innerHTML = ''; // bersihkan loading

                if (data.result === 'success' && data.data.length > 0) {
                    data.data.forEach(msg => {
                        const newMsg = document.createElement('div');
                        newMsg.classList.add('msg-bubble');
                        newMsg.innerHTML = `
                            <strong>${msg.nama}</strong>
                            <p>${msg.pesan}</p>
                        `;
                        messagesList.appendChild(newMsg);
                    });
                } else {
                    // Jika kosong atau error
                    messagesList.innerHTML = `
                        <div class="msg-bubble">
                            <strong>Keluarga Bpk. Budi (Contoh)</strong>
                            <p>Selamat bersilaturahmi. Mohon maaf lahir dan batin.</p>
                        </div>
                    `;
                }
            })
            .catch(err => {
                console.error("Gagal memuat buku tamu:", err);
                messagesList.innerHTML = `
                    <div class="msg-bubble">
                        <strong style="color: red;">Koneksi terputus</strong>
                        <p>Histori perpesanan gagal dimuat sementara waktu.</p>
                    </div>
                `;
            });
    };

    // Panggil muat data awal
    if (messagesList) {
        loadMessages();
    }

    if (guestbookForm) {
        guestbookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nama = document.getElementById('gbNama').value;
            const pesan = document.getElementById('gbPesan').value;

            const btn = guestbookForm.querySelector('button');
            btn.innerText = "Mengirim...";
            btn.disabled = true;

            const urlEncodedData = new URLSearchParams();
            urlEncodedData.append('nama', nama);
            urlEncodedData.append('pesan', pesan);

            // POST ke Google Apps script yang sama
            fetch(scriptURL, { method: 'POST', body: urlEncodedData, mode: 'no-cors' })
                .then(response => {
                    // Update tampilan web seketika tanpa nunggu load ulang biar terasa realtime
                    const newMsg = document.createElement('div');
                    newMsg.classList.add('msg-bubble');
                    // Style border sedikit berbeda untuk pesan asli user yg baru dikirim (opsional)
                    newMsg.style.borderLeftColor = "var(--primary-color)";
                    newMsg.innerHTML = `
                        <strong>${nama}</strong>
                        <p>${pesan}</p>
                    `;
                    // Masukkan ke paling atas tanpa perlu request ulang semua list
                    const firstMsg = messagesList.querySelector('.msg-bubble');
                    if (firstMsg && firstMsg.textContent.includes('Keluarga Bpk. Budi (Contoh)')) {
                        messagesList.innerHTML = '';
                    }
                    messagesList.insertBefore(newMsg, messagesList.firstChild);

                    guestbookForm.reset();
                    btn.innerText = "Kirim Ucapan";
                    btn.disabled = false;
                })
                .catch(error => {
                    console.error('Error saat kirim buku tamu!', error.message);
                    btn.innerText = "Gagal. Coba lagi?";
                    btn.disabled = false;
                    setTimeout(() => btn.innerText = "Kirim Ucapan", 3000);
                });
        });
    }

    // 5. Audio Autoplay Logic
    const bgMusic = document.getElementById('bg-music');
    const btnAudio = document.getElementById('btn-audio');
    let isPlaying = false;

    if (bgMusic && btnAudio) {
        // Handle autoplay limits (browser block)
        const playAudio = () => {
            if (!isPlaying) {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    btnAudio.classList.remove('paused');

                    // Remove trigger events once played successfully
                    document.body.removeEventListener('click', playAudio);
                    document.body.removeEventListener('touchstart', playAudio);
                    window.removeEventListener('scroll', playAudio);
                    window.removeEventListener('wheel', playAudio);
                }).catch(err => {
                    console.log("Autoplay blocked by browser policy. Menunggu interaksi...");
                });
            }
        };

        const executeUndangan = (e) => {
            if (e) e.preventDefault();
            // Unlock scroll
            document.documentElement.classList.remove('locked');
            document.body.classList.remove('locked');
            document.removeEventListener('touchmove', preventScroll);
            
            // Putar lagu
            playAudio();

            // Sembunyikan tombol 'Buka Undangan' agar lebih clean setelah dibuka
            const btnBuka = document.getElementById('btn-buka');
            if (btnBuka) {
                btnBuka.style.display = 'none';
            }

            // Tampilkan konten utama dengan menghapus class hidden
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.classList.remove('hidden-content');
                // Trigger reflow untuk body agar animasi bisa smooth jika ada text-fading
                void mainContent.offsetWidth;
                mainContent.style.transition = 'opacity 1.5s ease-in-out';
                mainContent.style.opacity = '1';
                
                // Refresh AOS animations untuk elemen yg baru dimunculkan
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
            }

            // Scroll manual ke event details secara halus (karena td preventDefault)
            const eventDetails = document.getElementById('event-details');
            if (eventDetails) {
                setTimeout(() => {
                    eventDetails.scrollIntoView({ behavior: 'smooth' });
                }, 100); // Jeda sejenak agar browser merender main-content dulu
            }
        };

        // Trigger HANYA saat menekan tombol "Buka Undangan"
        const btnBuka = document.getElementById('btn-buka');
        if (btnBuka) {
            btnBuka.addEventListener('click', executeUndangan);
        }

        // Toggle playback on button click
        btnAudio.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering body click twice
            if (isPlaying) {
                bgMusic.pause();
                btnAudio.classList.add('paused');
                isPlaying = false;
            } else {
                bgMusic.play();
                btnAudio.classList.remove('paused');
                isPlaying = true;
            }
        });
    }
});
