"use client"; 
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import React from "react";
import ImagewithFallBack from "./ImagewithFallBack";

const NavBar = () => {
  const {data:session}=authClient.useSession();
  const user = session?.user;
  console.log(user);
  const router=useRouter();

  return (
    <header className="navbar">
      <nav>
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={32}
            height={32}
          />
          <h1>SnapCast</h1>
        </Link>
        {user && (
          <figure>
            <button onClick={()=>router.push(`/profile/${user?.id}`)}>
              <ImagewithFallBack
                src={session?.user?.image || ''}
                alt="useImage"
                width={36}
                height={36}
                className="rounded-full aspect-square"
              />
            </button>
            <button onClick={async()=>{
              return await authClient.signOut({
             fetchOptions:{
            onSuccess:()=>{
              redirect("/sign-in");
            }  
             }   
              })
            }}>
   <Image src="/assets/icons/logout.svg" alt="logout" height={24} width={24} className="rotate-180"/>
          
            </button>
         </figure>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
