"use client";

import { useEffect, useState } from "react";
import { useAdminStore, CertificateRequest, CertificateStatus, DeliveryMethod } from "@/lib/adminStore";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const TABS: Array<CertificateStatus | "all"> = ["all", "pending", "issued", "rejected"];

function getStatusBadge(status: CertificateStatus) {
  const styles: Record<CertificateStatus, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    issued: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function CertificatesAdminPage() {
  const { certificateRequests, fetchCertificateRequests, isLoadingCertificateRequests } = useAdminStore();
  const [activeTab, setActiveTab] = useState<CertificateStatus | "all">("all");
  const [selected, setSelected] = useState<CertificateRequest | null>(null);

  useEffect(() => {
    fetchCertificateRequests();
  }, [fetchCertificateRequests]);

  const filtered =
    activeTab === "all" ? certificateRequests : certificateRequests.filter((r) => r.status === activeTab);

  if (isLoadingCertificateRequests && certificateRequests.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Certificate Requests</h1>
        <p className="text-white/50 mt-2">Review activity point claims and issue certificates.</p>
      </div>

      <div className="flex gap-6 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-white text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0E0E0E] shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/50">Name</TableHead>
              <TableHead className="text-white/50">Department / Batch</TableHead>
              <TableHead className="text-white/50">Points Claimed</TableHead>
              <TableHead className="text-white/50">Submitted</TableHead>
              <TableHead className="text-white/50">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((req) => (
              <TableRow
                key={req.id}
                onClick={() => setSelected(req)}
                className="border-white/10 cursor-pointer hover:bg-white/5"
              >
                <TableCell className="text-white font-medium">{req.fullName}</TableCell>
                <TableCell className="text-white/70">
                  {req.department} · {req.batch}
                </TableCell>
                <TableCell className="text-white/70">{req.pointsClaimed}</TableCell>
                <TableCell className="text-white/50">{format(new Date(req.createdAt), "PP")}</TableCell>
                <TableCell>{getStatusBadge(req.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/50">No requests found.</div>
        )}
      </div>

      <ReviewDialog request={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ReviewDialog({ request, onClose }: { request: CertificateRequest | null; onClose: () => void }) {
  const { issueCertificate, rejectCertificateRequest } = useAdminStore();

  const [pointsAwarded, setPointsAwarded] = useState<25 | 50>(25);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (request) {
      setPointsAwarded(request.pointsClaimed);
      setDeliveryMethod(request.deliveryMethod);
      setShowRejectForm(false);
      setRejectionReason("");
    }
  }, [request]);

  if (!request) return null;

  const handleIssue = async () => {
    setIsIssuing(true);
    try {
      await issueCertificate(request.id, pointsAwarded, deliveryMethod);
      toast.success(`Certificate issued for ${request.fullName}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to issue certificate");
    } finally {
      setIsIssuing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setIsRejecting(true);
    try {
      await rejectCertificateRequest(request.id, rejectionReason.trim(), deliveryMethod);
      toast.success(`Request rejected for ${request.fullName}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{request.fullName}</DialogTitle>
          <DialogDescription>Submitted {format(new Date(request.createdAt), "PPp")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <DetailField label="Email" value={request.email} />
            <DetailField label="Discord" value={request.discordUsername || "—"} />
            <DetailField label="Department" value={request.department} />
            <DetailField label="Batch" value={request.batch} />
            <DetailField label="MUID" value={request.muid} />
            <DetailField label="µLearn Rank" value={request.mulearnRank} />
            <DetailField label="Karma" value={String(request.karma)} />
            <DetailField label="Points Claimed" value={String(request.pointsClaimed)} />
          </div>

          {request.rankCardUrl && (
            <a
              href={request.rankCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white underline underline-offset-2"
            >
              View rank card <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <div>
            <p className="text-xs font-semibold text-white/50 mb-1">Reason</p>
            <p className="text-white/80 whitespace-pre-wrap">{request.reason}</p>
          </div>

          {request.status === "issued" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <div className="text-xs">
                Issued {request.pointsAwarded} points · {request.certificateNumber}
                {request.certificateUrl && (
                  <>
                    {" "}
                    ·{" "}
                    <a href={request.certificateUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      View PDF
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {request.status === "rejected" && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="text-xs">Rejected: {request.rejectionReason}</div>
            </div>
          )}

          {request.status === "pending" && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Points Awarded</label>
                <div className="flex gap-2">
                  {([25, 50] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPointsAwarded(val)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        pointsAwarded === val
                          ? "bg-white text-black border-white"
                          : "bg-[#141414] text-white/70 border-white/10 hover:bg-white/5"
                      }`}
                    >
                      {val} points
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Delivery Method</label>
                <div className="flex gap-2">
                  {(["email", "discord", "both"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDeliveryMethod(val)}
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
              </div>

              {showRejectForm ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Rejection Reason</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this request is being rejected..."
                    className="bg-[#141414] border-white/10 text-white min-h-20"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRejectForm(false)}
                      className="bg-transparent text-white border-white/10 hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || isRejecting}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectForm(true)}
                    className="bg-transparent text-red-400 border-red-500/20 hover:bg-red-500/10"
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    onClick={handleIssue}
                    disabled={isIssuing}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    {isIssuing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Approve & Issue
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">{label}</p>
      <p className="text-white/90">{value}</p>
    </div>
  );
}
