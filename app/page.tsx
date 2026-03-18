import Image from "next/image";
import {LoginForm} from "@/components/LoginForm";
import dynamic from "next/dynamic";

export default function Home() {
  return (
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Griddb adminyare panel
          </h1>
          <LoginForm />
        </div>
  );
}

