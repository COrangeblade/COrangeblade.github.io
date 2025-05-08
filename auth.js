document.getElementById("login-btn").onclick = () => {
  const clientId = "Ov23liupPam9trKuoXLw";
  const redirectUri = "https://corangeblade.github.io";
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
};
