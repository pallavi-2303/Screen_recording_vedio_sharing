"use client"
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = () => {
  const handleSignIn=async()=>{
return await authClient.signIn.social({provider:'google'})
  }
  return (
    <main className="sign-in">
      <aside className="testimonial">
        <Link href={"/"}>
          <Image
            src="/assets/icons/logo.svg"
            width={32}
            height={32}
            alt="logo"
          />
          <h1>SnapCast</h1>
        </Link>
        <div className="description">
          <section>
            <figure>
              {Array.from({ length: 5 }).map((_, index) => (
                <Image
                  key={index}
                  src="/assets/icons/star.svg"
                  alt="star"
                  width={20}
                  height={20}
                />
              ))}
            </figure>
            <p>
              SnapCast is your go-to platform for sharing and discovering
              engaging video content. Connect with a vibrant community, showcase
              your creativity, and explore a diverse library of videos from
              creators around the world.
            </p>
            <article>
              <Image
                src="/assets/images/jason.png"
                alt="jason"
                height={64}
                width={64}
                className="rounded-full"
              />
              <div>
                <h2>Jason Riveria</h2>
                <p>Product Designer,NovaByte</p>
              </div>
            </article>
          </section>
        </div>
        <p> SnapCast {(new Date()).getFullYear()}</p>
      </aside>
      <aside className="google-sign-in">
<section>
   <Link href={"/"}>
          <Image
            src="/assets/icons/logo.svg"
            width={40}
            height={40}
            alt="logo"
          />
          <h1>SnapCast</h1>
        </Link>
        <p>Create and share your very first <span>SnapCast video</span> in no time!</p>
<button onClick={handleSignIn}>
   <Image
            src="/assets/icons/google.svg"
            width={22}
            height={22}
            alt="google"
          />
  <span>Sign in with google</span>
</button>
</section>

      </aside>
      <div className="overlay"></div>
    </main>
  );
};

export default page;
