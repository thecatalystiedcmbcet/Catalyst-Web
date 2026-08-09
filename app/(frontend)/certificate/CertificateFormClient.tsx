"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const certificateFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  discordUsername: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  batch: z.string().min(1, "Batch is required"),
  muid: z.string().min(1, "µLearn ID is required"),
  mulearnRank: z.string().min(1, "Current µLearn rank is required"),
  karma: z.string().min(1, "Enter your karma points").regex(/^\d+$/, "Karma must be a whole number"),
  rankCardUrl: z.string().optional(),
  reason: z.string().min(10, "Please explain why you're applying (at least 10 characters)"),
  pointsClaimed: z.enum(["25", "50"], { message: "Select 25 or 50 points" }),
  deliveryMethod: z.enum(["email", "discord", "both"], { message: "Choose how to receive your certificate" }),
});

type CertificateFormValues = z.infer<typeof certificateFormSchema>;
type FieldName = keyof CertificateFormValues;

const STEPS: Array<{ title: string; description: string; fields: FieldName[] }> = [
  {
    title: "Your Details",
    description: "Who should this certificate be issued to?",
    fields: ["fullName", "email", "discordUsername"],
  },
  {
    title: "Academic Info",
    description: "Tell us where you study and your µLearn standing.",
    fields: ["department", "batch", "muid", "mulearnRank", "karma"],
  },
  {
    title: "Proof & Reason",
    description: "Back up your claim so it's easy to verify.",
    fields: ["rankCardUrl", "reason"],
  },
  {
    title: "Points & Delivery",
    description: "How many points and where should we send it?",
    fields: ["pointsClaimed", "deliveryMethod"],
  },
];

async function uploadProof(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const filename = `certificate-proofs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("image")
    .upload(filename, file, { upsert: false, cacheControl: "31536000" });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("image").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export default function CertificateFormClient() {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      discordUsername: "",
      department: "",
      batch: "",
      muid: "",
      mulearnRank: "",
      karma: "",
      rankCardUrl: "",
      reason: "",
      pointsClaimed: "25",
      deliveryMethod: "email",
    },
  });

  const pointsClaimed = watch("pointsClaimed");
  const deliveryMethod = watch("deliveryMethod");
  const isLastStep = step === STEPS.length - 1;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
  };

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: CertificateFormValues) => {
    try {
      let rankCardUrl = data.rankCardUrl || "";
      if (pendingFile) {
        rankCardUrl = await uploadProof(pendingFile);
      }

      const supabase = createClient();
      const { error } = await supabase.from("certificate_requests").insert({
        full_name: data.fullName,
        email: data.email,
        discord_username: data.discordUsername || null,
        department: data.department,
        batch: data.batch,
        muid: data.muid,
        mulearn_rank: data.mulearnRank,
        karma: Number(data.karma),
        rank_card_url: rankCardUrl || null,
        reason: data.reason,
        points_claimed: Number(data.pointsClaimed),
        delivery_method: data.deliveryMethod,
      });
      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4 pt-28 md:pt-40">
        <Card className="w-full max-w-md bg-[#0B0B0B] border-white/10 text-white text-center">
          <CardContent className="pt-6 space-y-3">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <h2 className="text-xl font-semibold">Request submitted</h2>
            <p className="text-white/50 text-sm">
              We&apos;ve received your certificate request. You&apos;ll hear back once it&apos;s reviewed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 pt-28 md:pt-40 pb-16">
      <Card className="w-full max-w-2xl bg-[#0B0B0B] border-white/10 text-white shadow-2xl">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Claim Activity Points</CardTitle>
            <CardDescription className="text-white/40">{STEPS[step].description}</CardDescription>
          </div>
          <StepIndicator step={step} />
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              if (!isLastStep) {
                e.preventDefault();
                return;
              }
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" error={errors.fullName?.message}>
                    <Input {...register("fullName")} className={inputClass} placeholder="Jane Doe" />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <Input type="email" {...register("email")} className={inputClass} placeholder="jane@example.com" />
                  </Field>
                </div>

                <Field label="Discord Username (optional)" error={errors.discordUsername?.message}>
                  <Input {...register("discordUsername")} className={inputClass} placeholder="janedoe" />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Department" error={errors.department?.message}>
                    <Input {...register("department")} className={inputClass} placeholder="Computer Science" />
                  </Field>
                  <Field label="Batch" error={errors.batch?.message}>
                    <Input {...register("batch")} className={inputClass} placeholder="2023-2027" />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="µLearn ID (MUID)" error={errors.muid?.message}>
                    <Input {...register("muid")} className={inputClass} placeholder="MUID12345" />
                  </Field>
                  <Field label="Current µLearn Rank" error={errors.mulearnRank?.message}>
                    <Input {...register("mulearnRank")} className={inputClass} placeholder="Contributor" />
                  </Field>
                </div>

                <Field label="Karma" error={errors.karma?.message}>
                  <Input type="number" {...register("karma")} className={inputClass} placeholder="12500" />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Rank Card">
                  <div className="flex flex-col gap-2 p-3 bg-[#141414] rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        id="rank-card-upload"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="rank-card-upload"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        Upload Screenshot
                      </label>
                      {pendingFile && <span className="text-xs text-white/50">{pendingFile.name}</span>}
                    </div>
                    <span className="text-[11px] text-white/30">Or paste a link below instead</span>
                    <Input
                      {...register("rankCardUrl")}
                      className={inputClass}
                      placeholder="https://mulearn.org/..."
                      disabled={!!pendingFile}
                    />
                  </div>
                </Field>

                <Field label="Why are you applying?" error={errors.reason?.message}>
                  <Textarea
                    {...register("reason")}
                    className={`${inputClass} min-h-24`}
                    placeholder="Explain your activity and why you qualify..."
                  />
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                <Field label="Points Claimed" error={errors.pointsClaimed?.message}>
                  <div className="flex gap-2">
                    {(["25", "50"] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValue("pointsClaimed", val, { shouldValidate: true })}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          pointsClaimed === val
                            ? "bg-white text-black border-white"
                            : "bg-[#141414] text-white/70 border-white/10 hover:bg-white/5"
                        }`}
                      >
                        {val} points
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Delivery Method" error={errors.deliveryMethod?.message}>
                  <div className="flex gap-2">
                    {(["email", "discord", "both"] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValue("deliveryMethod", val, { shouldValidate: true })}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                          deliveryMethod === val
                            ? "bg-white text-black border-white"
                            : "bg-[#141414] text-white/70 border-white/10 hover:bg-white/5"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            <div className="flex gap-2 justify-between pt-4 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0}
                className="bg-transparent text-white border-white/10 hover:bg-white/5 disabled:opacity-30"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-white/90 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={goNext}
                  className="bg-white text-black hover:bg-white/90 font-medium"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const inputClass = "bg-[#141414] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20";

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => (
        <div key={s.title} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < step
                  ? "bg-white text-black"
                  : i === step
                  ? "bg-white/10 text-white border border-white"
                  : "bg-white/5 text-white/30 border border-white/10"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-[10px] whitespace-nowrap ${i <= step ? "text-white/70" : "text-white/30"}`}>
              {s.title}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px flex-1 mx-2 mb-4 ${i < step ? "bg-white" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-white/70">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
