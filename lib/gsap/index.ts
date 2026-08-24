"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  gsap.defaults({
    ease: "power2.out",
    duration: 0.5,
  });
}

export { gsap, useGSAP, ScrollTrigger };
