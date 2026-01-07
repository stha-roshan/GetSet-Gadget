const form = document.getElementById("loginForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value.trim(),
      }),
    });

    const result = await response.json();
    console.log("LOGIN RESPONSE:", result);

    if (!response.ok) {
      alert("Login failed: " + result.message);
      return;
    }

    // ✅ Correct access path
    const user = result.data.user;
    
    localStorage.setItem('accessToken', result.data.accessToken);
    localStorage.setItem('refreshToken', result.data.refreshToken);

    alert(`Login successful: welcome ${user.name}`);
    window.location.href = "/home";
  } catch (error) {
    console.error("Unexpected error:", error);
    alert("Something went wrong. Please try again.");
  }
});
