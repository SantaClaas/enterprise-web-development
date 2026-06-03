async function getUser() {
  const response = await fetch("/api/user");
  console.debug("User response", response);
}
