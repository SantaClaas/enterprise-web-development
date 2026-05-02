export default function SignIn() {
  return (
    <>
      <main class="grid h-full items-end">
        <h1 class="text-center font-serif text-6xl font-black text-purple-900">Welcome</h1>
        <section class="rounded-3xl p-6 text-base leading-6">
          <button class="mt-6 block w-full rounded-full bg-purple-300 px-6 py-4">
            Sign in with Passkey
          </button>
          <button class="mt-4 block w-full px-6 py-4 text-purple-700">Register</button>
        </section>
      </main>
    </>
  );
}
