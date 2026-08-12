const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const page = document.body.dataset.page;

if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });
}

if (page) {
    document.querySelectorAll('.site-nav a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.includes(`${page}.html`)) {
            link.classList.add('active');
        }
    });
}

document.querySelectorAll('form[data-prevent="true"]').forEach((form) => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Form submitted successfully.');
    });
});