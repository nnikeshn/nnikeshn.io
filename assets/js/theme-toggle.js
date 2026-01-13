document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const body = document.body;
  const icon = toggleBtn.querySelector('i');
  
  // Check localStorage for theme preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    body.classList.add('dark-mode');
    icon.classList.remove('bi-moon');
    icon.classList.add('bi-sun');
  }
  
  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
      icon.classList.remove('bi-moon');
      icon.classList.add('bi-sun');
      localStorage.setItem('theme', 'dark');
    } else {
      icon.classList.remove('bi-sun');
      icon.classList.add('bi-moon');
      localStorage.setItem('theme', 'light');
    }
  });
});
