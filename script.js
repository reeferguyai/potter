// Initialize Icons
lucide.createIcons();

// Age Verification Gate Logic
function verifyAge(isOfAge) {
    if (isOfAge) {
        localStorage.setItem('potgrowhub_age_verified', 'true');
        document.getElementById('ageGateModal').style.display = 'none';
        if (!localStorage.getItem('potgrowhub_cookies_accepted')) {
            document.getElementById('cookieBanner').style.display = 'flex';
        }
    } else {
        window.location.href = 'https://www.google.com';
    }
}

function acceptCookies() {
    localStorage.setItem('potgrowhub_cookies_accepted', 'true');
    document.getElementById('cookieBanner').style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('potgrowhub_age_verified') === 'true') {
        document.getElementById('ageGateModal').style.display = 'none';
        if (!localStorage.getItem('potgrowhub_cookies_accepted')) {
            document.getElementById('cookieBanner').style.display = 'flex';
        }
    }
});

// Auto-expanding textarea
const tx = document.getElementsByTagName("textarea")[0];
if (tx) {
    tx.addEventListener("input", OnInput, false);
}

function OnInput() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight - 16) + "px";
}

// Service Worker Registration for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => console.log('SW registration failed: ', err));
    });
}