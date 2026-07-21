"use client";
import { useState, useEffect, useTransition } from "react";
import { useAdminStore, Pioneer } from "@/lib/adminStore";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader2, Upload, ImageIcon, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const pioneerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subtitle: z.string().optional(),
  logo_url: z.string().min(1, "Logo is required"),
  instagram_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
});

type PioneerFormValues = z.infer<typeof pioneerFormSchema>;

export default function PioneersAdminPage() {
  const {
    pioneers,
    fetchPioneers,
    addPioneer,
    updatePioneer,
    deletePioneer,
    reorderPioneers,
    isLoadingPioneers,
    uploadFile,
  } = useAdminStore();

  const [localItems, setLocalItems] = useState<Pioneer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPioneer, setEditingPioneer] = useState<Pioneer | null>(null);
  const [deletingPioneer, setDeletingPioneer] = useState<Pioneer | null>(null);
  const [isPending, startTransition] = useTransition();

  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoPreview, setLogoPreview] = useState("");
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPioneers();
  }, [fetchPioneers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors store data into a locally reorderable copy for drag-and-drop
    setLocalItems([...pioneers].sort((a, b) => a.sort_order - b.sort_order));
  }, [pioneers]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PioneerFormValues>({
    resolver: zodResolver(pioneerFormSchema),
    defaultValues: {
      name: "",
      subtitle: "",
      logo_url: "",
      instagram_url: "",
      linkedin_url: "",
      portfolio_url: "",
    },
  });

  useEffect(() => {
    if (editingPioneer) {
      reset({
        name: editingPioneer.name,
        subtitle: editingPioneer.subtitle || "",
        logo_url: editingPioneer.logo_url || "",
        instagram_url: editingPioneer.instagram_url || "",
        linkedin_url: editingPioneer.linkedin_url || "",
        portfolio_url: editingPioneer.portfolio_url || "",
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs form preview when the edited pioneer changes
      setLogoPreview(editingPioneer.logo_url || "");
    } else {
      reset({
        name: "",
        subtitle: "",
        logo_url: "",
        instagram_url: "",
        linkedin_url: "",
        portfolio_url: "",
      });
      setLogoPreview("");
    }
    setLogoProgress(0);
    setIsLogoUploading(false);
    setPendingLogoFile(null);
  }, [editingPioneer, isFormOpen, reset]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setLogoPreview(tempUrl);
    setPendingLogoFile(file);
    setIsLogoUploading(true);
    setLogoProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setLogoProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsLogoUploading(false);
        setValue("logo_url", tempUrl, { shouldValidate: true });
      }
    }, 60);
  };

  const onSubmit = (data: PioneerFormValues) => {
    startTransition(async () => {
      try {
        let finalLogoUrl = data.logo_url;

        if (pendingLogoFile) {
          setIsLogoUploading(true);
          finalLogoUrl = await uploadFile(pendingLogoFile, "pioneers");
          setIsLogoUploading(false);
        }

        const formattedData = {
          name: data.name,
          subtitle: data.subtitle || "",
          logo_url: finalLogoUrl,
          instagram_url: data.instagram_url || "",
          linkedin_url: data.linkedin_url || "",
          portfolio_url: data.portfolio_url || "",
          sort_order: editingPioneer ? editingPioneer.sort_order : localItems.length,
        };

        if (editingPioneer) {
          await updatePioneer(editingPioneer.id, formattedData);
          toast.success(`Updated pioneer: ${data.name}`);
        } else {
          await addPioneer(formattedData);
          toast.success(`Created pioneer: ${data.name}`);
        }
        setIsFormOpen(false);
        setEditingPioneer(null);
        setPendingLogoFile(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to save pioneer. Check console for details.");
        setIsLogoUploading(false);
      }
    });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalItems(items);

    try {
      await reorderPioneers(items);
      toast.success("Order updated successfully!");
    } catch {
      toast.error("Failed to update order");
      setLocalItems(pioneers); // Revert on failure
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPioneer) return;
    try {
      await deletePioneer(deletingPioneer.id);
      toast.success("Pioneer deleted successfully.");
      setDeletingPioneer(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete pioneer.");
    }
  };

  if (isLoadingPioneers && pioneers.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Our Pioneers</h1>
          <p className="text-white/50 mt-2">Manage the pioneers shown in the homepage marquee.</p>
        </div>
        <Button
          onClick={() => {
            setEditingPioneer(null);
            setIsFormOpen(true);
          }}
          className="bg-white text-black hover:bg-white/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Pioneer
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0E0E0E] p-6 shadow-sm">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="pioneers-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {localItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center justify-between gap-4 bg-[#141414] border border-white/10 p-4 rounded-lg group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab text-white/30 hover:text-white/70"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>
                          {item.logo_url ? (
                            <img src={item.logo_url} alt={item.name} className="h-10 w-10 object-contain rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-white/10 rounded flex items-center justify-center text-white/30">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{item.name}</span>
                            {item.subtitle && <span className="text-xs text-white/50">{item.subtitle}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPioneer(item);
                              setIsFormOpen(true);
                            }}
                            className="text-white/30 hover:text-white hover:bg-white/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingPioneer(item)}
                            className="text-white/30 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {localItems.length === 0 && (
          <div className="text-center py-12 text-white/50 border border-dashed border-white/10 rounded-lg">
            No pioneers found. Click &quot;Add Pioneer&quot; to create your first one.
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPioneer ? "Edit Pioneer" : "Add Pioneer"}</DialogTitle>
            <DialogDescription>Add a new pioneer to the marquee.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Name</label>
              <Input
                placeholder="Unibotix"
                {...register("name")}
                className="bg-[#141414] border-white/10 text-white"
              />
              {errors.name && <p className="text-[11px] text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Subtitle</label>
              <Input
                placeholder="Innovations Pvt. Ltd."
                {...register("subtitle")}
                className="bg-[#141414] border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Instagram URL</label>
              <Input
                placeholder="https://instagram.com/..."
                {...register("instagram_url")}
                className="bg-[#141414] border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">LinkedIn URL</label>
              <Input
                placeholder="https://linkedin.com/in/..."
                {...register("linkedin_url")}
                className="bg-[#141414] border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Portfolio URL</label>
              <Input
                placeholder="https://..."
                {...register("portfolio_url")}
                className="bg-[#141414] border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Logo</label>
              <div className="flex gap-4 items-center p-3 bg-[#141414] rounded-lg border border-white/10">
                <div className="relative h-16 w-16 shrink-0 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Preview" className="h-full w-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-white/20" />
                  )}
                  {isLogoUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white">
                      {logoProgress}%
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-upload"
                    onChange={handleLogoSelect}
                    disabled={isLogoUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer ${
                      isLogoUploading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Upload Logo
                  </label>
                  {isLogoUploading && (
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${logoProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>
              {errors.logo_url && <p className="text-[11px] text-red-400">{errors.logo_url.message}</p>}
            </div>

            <DialogFooter className="pt-4 border-t border-white/5">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="bg-transparent text-white border-white/10 hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isPending || isLogoUploading} className="bg-white text-black hover:bg-white/90">
                {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPioneer ? "Save" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingPioneer !== null} onOpenChange={(open) => !open && setDeletingPioneer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold text-white">{deletingPioneer?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
