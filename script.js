document.addEventListener('DOMContentLoaded', () => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbxzlJnFn1zcMX8WyL2392GXNHSbM2wokFXT8JcXtUpYNkNpkVWJQVm9aYC-5ruwMgnXyQ/exec";
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

    // 4. Guestbook Form Handling Simulation
    const guestbookForm = document.getElementById('guestbookForm');
    const messagesList = document.getElementById('messagesList');

    if (guestbookForm) {
        guestbookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nama = document.getElementById('gbNama').value;
            const pesan = document.getElementById('gbPesan').value;

            const btn = guestbookForm.querySelector('button');
            btn.innerText = "Mengirim...";
            btn.disabled = true;

            setTimeout(() => {
                // Create new message bubble
                const newMsg = document.createElement('div');
                newMsg.classList.add('msg-bubble');
                newMsg.innerHTML = `
                    <strong>${nama}</strong>
                    <p>${pesan}</p>
                `;

                // Prepend to list
                messagesList.insertBefore(newMsg, messagesList.firstChild);

                guestbookForm.reset();
                btn.innerText = "Kirim Ucapan";
                btn.disabled = false;
            }, 800);
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
                    document.body.removeEventListener('scroll', playAudio);
                    document.body.removeEventListener('touchstart', playAudio);
                }).catch(err => {
                    console.log("Autoplay blocked by browser policy. Menunggu interaksi...");
                });
            }
        };

        // Trigger saat menekan tombol "Buka Undangan" atau area lain
        const btnBuka = document.getElementById('btn-buka');
        if (btnBuka) {
            btnBuka.addEventListener('click', playAudio);
        }

        // Attempt playback on first general interaction
        document.body.addEventListener('click', playAudio);
        document.body.addEventListener('touchstart', playAudio);
        document.body.addEventListener('scroll', playAudio, { once: true });

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
