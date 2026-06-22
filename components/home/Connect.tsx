"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const Connect = () => {
  const [showModal, setShowModal] = useState(false);
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
        once: true,
      },
    });

    tl.fromTo(
      container.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      ".connect-content > *",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
      "-=0.4"
    );
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.currentTarget;
    const formData = new FormData(target);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      await fetch(
        "https://discord.com/api/webhooks/1497959545345933345/feiohQ6PS2qSh-K9UKfozwUjMyA7enRnz4qMyCAJ79vmByQCXBVgC1hAJfxJf70Sx-YQ",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embeds: [
              {
                title: "New Contact Submission",
                color: 5814783,
                fields: [
                  { name: "👤 Name", value: data.name, inline: true },
                  { name: "📧 Email", value: data.email, inline: true },
                  { name: "📞 Phone", value: data.phone, inline: true },
                  { name: "📝 Subject", value: data.subject },
                  { name: "💬 Message", value: data.message },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        },
      );

      setShowModal(true); // 👈 trigger modal
      e.currentTarget.reset(); // optional: clear form
    } catch (err) {
      console.error(err);
      alert("Failed to send");
    }
  };

  return (
    <section ref={container} className="relative rounded-3xl bg-gradient-to-br from-[#181818] to-[#0a0a0a] text-white overflow-hidden shadow-2xl border border-white/10 group max-w-6xl mx-auto">
      {/* Dynamic Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-[#111] border border-white/20 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(255,255,255,0.1)] max-w-sm transform scale-100 animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-primary tracking-widest uppercase mb-4 text-white">🎉 Whoohoo!</h3>
            <p className="mb-8 text-gray-400 font-secondary text-lg">
              Your feedback has been submitted.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-white text-black px-8 py-3 rounded-lg font-secondary font-bold uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Decorative Image */}
      <Image
        src="/connect.png"
        alt="Contact illustration"
        width={300}
        height={300}
        className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-64 md:w-80 h-auto z-0 opacity-20 invert mix-blend-screen"
        style={{ width: 'auto', height: 'auto' }}
      />

      <div className="connect-content relative z-10 p-6 md:p-10 text-left h-full flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-primary font-normal mb-6 uppercase tracking-[0.1em] text-white">
          GET IN TOUCH WITH US
        </h2>

        <form className="space-y-5 font-secondary w-full" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-white/80 text-sm tracking-wide">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="name" 
                name="name"
                placeholder="Your Full Name" 
                className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-lg focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/50 transition-all duration-300" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-white/80 text-sm tracking-wide">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@gmail.com"
                className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-lg focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/50 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold text-white/80 text-sm tracking-wide">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1555123457"
                className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-lg focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/50 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="font-semibold text-white/80 text-sm tracking-wide">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="subject" 
                name="subject"
                placeholder="Enter the Subject" 
                className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-lg focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/50 transition-all duration-300" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-semibold text-white/80 text-sm tracking-wide">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Tell us how we can help you..!"
              className="min-h-[100px] resize-y bg-black/50 border-white/10 text-white placeholder:text-white/30 p-4 rounded-lg focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/50 transition-all duration-300"
              required
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="bg-white hover:bg-gray-200 text-black px-8 py-5 rounded-lg font-secondary font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-1 w-full md:w-auto"
            >
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Connect;
