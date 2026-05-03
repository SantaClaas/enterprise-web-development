import Body from "./Body";
import Icon from "./Icon";

export default function SignIn() {
  return (
    <Body class="h-dvh p-4 md:p-6">
      <main class="grid h-full items-end">
        <h1 class="text-center font-serif text-6xl font-black text-purple-900">Welcome</h1>
        <section class="rounded-3xl p-6 text-base leading-6">
          {/* TODO: Button states styles */}
          <button class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-purple-300 px-6 py-4">
            <Icon class="size-6 fill-slate-950" name="passkey" />
            <span>Sign in with Passkey</span>
          </button>
          <button class="mt-4 block w-full px-6 py-4 text-purple-700">Register</button>
        </section>
      </main>
    </Body>
  );
}
