import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("cine", "0.22,1,0.36,1");
  CustomEase.create("inout", "0.76,0,0.24,1");
  gsap.defaults({ ease: "cine" });
}

export { gsap, ScrollTrigger };
