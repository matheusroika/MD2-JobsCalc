function togglePasswordVisibility() {
    const eyeIcon = document.querySelector(".eye-icon")
    const passwordInput = document.getElementById("password")
    const inputType = passwordInput.getAttribute("type") === "password" ? "text" : "password"

    passwordInput.setAttribute('type', inputType)
    eyeIcon.classList.toggle('on')
  }