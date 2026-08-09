import { Metadata } from "next";
import CertificateFormClient from "./CertificateFormClient";

export const metadata: Metadata = {
  title: "Claim Activity Points | Catalyst",
  description: "Request an activity point certificate based on your µLearn karma and rank.",
  alternates: {
    canonical: "/certificate",
  },
};

export default function CertificatePage() {
  return <CertificateFormClient />;
}
