// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function () {
  // Sélectionner le formulaire
  const loginForm = document.getElementById('loginForm');

  // Ajouter un écouteur d'événements pour la soumission du formulaire
  loginForm.addEventListener('submit', function (event) {
    // Empêcher le rechargement de la page par défaut
    event.preventDefault();

    // Récupérer les valeurs des champs
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Réinitialiser les messages d'erreur
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    emailError.textContent = '';
    passwordError.textContent = '';

    let isValid = true;

    // Vérifier si l'email est vide
    if (!email) {
      emailError.textContent = 'Email is required.';
      isValid = false;
    } else if (!validateEmail(email)) {
      emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    // Vérifier si le mot de passe est vide ou trop court
    if (!password) {
      passwordError.textContent = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters.';
      isValid = false;
    }

    // Si tout est valide, procéder (par exemple, afficher un message de succès)
    if (isValid) {
      alert('Login successful');
      // Remplacez cette ligne par la logique d'envoi à un serveur
      console.log('Email:', email);
      console.log('Password:', password);
    }
  });

  // Fonction pour valider l'adresse e-mail
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
