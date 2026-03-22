'use client' // Necessary because we are using React State

import React, { useState } from "react";
import HeroSection from "@/components/hero-sec/hero-section";
import ContentSection1 from "@/components/content/content-1";
import ContentSection2 from "@/components/content/content-2";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";
import GetStartedModal from "@/components/sections/get-started-modal";

export default function Home() {
  // 1. Centralize the state here
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Create a helper function to open the modal
  const openModal = () => setIsModalOpen(true);

  return (
    <main>
      {/* 3. Pass the trigger function to the Hero (which handles Header + Hero Buttons) */}
      <HeroSection onGetStartedClick={openModal} />
      
      <ContentSection1 />
      <ContentSection2 />
      
      {/* 4. Pass the trigger function to the Bottom CTA */}
      <CallToAction onGetStartedClick={openModal} />
      
      <Footer />

      {/* 5. The Modal sits at the root, listening for the state change */}
      <GetStartedModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </main>
  );
}