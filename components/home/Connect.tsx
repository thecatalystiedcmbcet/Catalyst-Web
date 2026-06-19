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
    <section ref={container} className="relative rounded-2xl bg-white text-black overflow-hidden shadow-xl">
      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg max-w-sm">
            <h3 className="text-xl font-semibold mb-3">🎉 Whoohoo!</h3>
            <p className="mb-6 text-gray-700">
              Your feedback has been submitted.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-neutral-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Image
        src="/connect.png"
        alt="Contact illustration"
        width={192}
        height={192}
        className="pointer-events-none absolute bottom-0 right-0 w-48 h-auto z-0"
        style={{ width: 'auto', height: 'auto' }}
      />

      <div className="connect-content relative z-10 p-8 sm:p-10 text-left bg-white/80 backdrop-blur-sm h-full flex flex-col justify-center">
        <h2 className="mb-8 text-2xl md:text-3xl font-primary font-normal tracking-wide uppercase">
          GET IN TOUCH WITH US
        </h2>

        <form className="space-y-6 font-secondary" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="Your Full Name" className="bg-white border-gray-200 placeholder-gray-300 text-sm md:text-base" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@gmail.com"
                className="bg-white border-gray-200 placeholder-gray-300 text-sm md:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1555123457"
                className="bg-white border-gray-200 placeholder-gray-300 text-sm md:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="font-semibold">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input id="subject" placeholder="Enter the Subject" className="bg-white border-gray-200 placeholder-gray-300 text-sm md:text-base" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-semibold">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us how we can help you..!"
              className="min-h-[120px] resize-y bg-white border-gray-200 placeholder-gray-300 text-sm md:text-base"
              required
            />
          </div>

          <Button type="submit" className="bg-black hover:bg-neutral-800 text-white px-8 py-5 rounded-md font-semibold text-sm">
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Connect;
