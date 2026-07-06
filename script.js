document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('contactForm');
form.addEventListener('submit', function (event) {
  event.preventDefault();
  const button = this.querySelector('button');
  button.textContent = 'Request Received';
  button.disabled = true;
});
