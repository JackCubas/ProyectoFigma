const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const signupButton = document.getElementById("signupButton");
const userButton = document.getElementById("userButton");
const pdfButton = document.getElementById("pdfButton");
const sessionStatus = document.getElementById("sessionStatus");
const sessionDescription = document.getElementById("sessionDescription");
const sessionRole = document.getElementById("sessionRole");

const hide = (element) => element.classList.add("hidden");
const show = (element) => element.classList.remove("hidden");

let datosUsuario = null;

try {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
        datosUsuario = JSON.parse(storedUser);
    }
} catch (error) {
    datosUsuario = null;
}

if (datosUsuario === null) {
    show(loginButton);
    show(signupButton);
    hide(logoutButton);
    hide(userButton);
    hide(pdfButton);
    sessionStatus.textContent = "Sesión no iniciada";
    sessionDescription.textContent = "Inicia sesión para habilitar las herramientas administrativas.";
    sessionRole.textContent = "Restringido";
} else {
    hide(loginButton);
    hide(signupButton);
    show(logoutButton);
    show(pdfButton);

    if (datosUsuario.rolUser === "ADMIN") {
        show(userButton);
        sessionRole.textContent = "Administrador";
    } else {
        hide(userButton);
        sessionRole.textContent = "Usuario";
    }

    const nombreUsuario = datosUsuario.nombreUser || datosUsuario.nombre || datosUsuario.email || "Usuario autenticado";
    sessionStatus.textContent = `${nombreUsuario} conectado`;
    sessionDescription.textContent = "La navegación se ha ajustado según tu sesión activa.";
}

