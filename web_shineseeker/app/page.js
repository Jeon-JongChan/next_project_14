import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import imgTitle from "/public/images/00_title.png";
import imgTitleCircle1 from "/public/images/00_title_circle1.png";
import imgTitleCircle2 from "/public/images/00_title_circle2.png";
import imgTitleCircle3 from "/public/images/00_title_circle3.png";
import imgTitleCircle4 from "/public/images/00_title_circle4.png";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-24" style={{backgroundImage: "url('/images/00_title_bg.png')"}}>
      <Link href="/main" className="max-w-full flex justify-center items-center">
        <div className="relative init-title">
          <Image src={imgTitleCircle1} className="absolute z-50 rotating-right-10 title-circle-1" style={{width: "12vw"}} />
          <Image src={imgTitle} className="w-full z-50" fill={true} />
        </div>
        <Image src={imgTitleCircle2} className="fixed z-30 rotating-right-20" style={{width: "23vw"}} />
        <Image src={imgTitleCircle3} className="fixed z-20 rotating-left-10" style={{width: "25vw"}} />
        <Image src={imgTitleCircle4} className="fixed z-10 rotating-right-20" style={{width: "36vw"}} />
      </Link>
    </main>
  );
}
