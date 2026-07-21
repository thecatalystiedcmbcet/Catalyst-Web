"use client";

import { useEffect, useState, useRef } from "react";
import { useAdminStore, TimelineItem } from "@/lib/adminStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Image from "next/image";

export default function TimelineAdminPage() {
  const {
    timelineItems,
    fetchTimelineItems,
    addTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    reorderTimelineItems,
    uploadFile,
    isLoadingTimeline,
  } = useAdminStore();

  const [localItems, setLocalItems] = useState<TimelineItem[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItemForUpload, setActiveItemForUpload] = useState<string | null>(null);

  useEffect(() => {
    fetchTimelineItems();
  }, [fetchTimelineItems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors store data into a locally reorderable copy for drag-and-drop
    setLocalItems([...timelineItems].sort((a, b) => a.sort_order - b.sort_order));
  }, [timelineItems]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalItems(items);
    
    try {
      await reorderTimelineItems(items);
      toast.success("Order updated successfully!");
    } catch {
      toast.error("Failed to update order");
      setLocalItems(timelineItems); // Revert on failure
    }
  };

  const handleUpdate = async (id: string, updates: Partial<TimelineItem>) => {
    try {
      await updateTimelineItem(id, updates);
      toast.success("Saved!");
    } catch (error) {
      toast.error("Failed to save updates");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteTimelineItem(id);
      toast.success("Event deleted!");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleAddNew = async () => {
    try {
      await addTimelineItem({
        category: "NEW CATEGORY",
        date: new Date().getFullYear().toString(),
        title: "New Timeline Event",
        description: "Event description goes here",
        image: "https://via.placeholder.com/800x600",
        sort_order: localItems.length,
      });
      toast.success("New event added!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add new event");
      console.error(error);
    }
  };

  const triggerImageUpload = (id: string) => {
    setActiveItemForUpload(id);
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeItemForUpload) return;

    setUploadingId(activeItemForUpload);
    try {
      const publicUrl = await uploadFile(file, "timeline");
      await updateTimelineItem(activeItemForUpload, { image: publicUrl });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploadingId(null);
      setActiveItemForUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isLoadingTimeline && timelineItems.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Timeline Events</h1>
          <p className="text-muted-foreground mt-2">
            Manage the history and achievements shown on the homepage timeline.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-white text-black hover:bg-gray-200">
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-sm">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="timeline-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {localItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-start gap-4 bg-black/40 border border-white/10 p-5 rounded-xl"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab text-white/30 hover:text-white/70 pt-2"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        {/* Image Preview */}
                        <div className="relative h-24 w-32 shrink-0 rounded-md overflow-hidden bg-white/5 border border-white/10 group">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/20">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-white hover:text-white hover:bg-white/20"
                              onClick={() => triggerImageUpload(item.id)}
                              disabled={uploadingId === item.id}
                            >
                              {uploadingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Change"
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Fields */}
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white/70 text-xs">Title</Label>
                              <Input
                                defaultValue={item.title}
                                onBlur={(e) => handleUpdate(item.id, { title: e.target.value })}
                                className="bg-black border-white/20 text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-white/70 text-xs">Year / Date</Label>
                                <Input
                                  defaultValue={item.date}
                                  onBlur={(e) => handleUpdate(item.id, { date: e.target.value })}
                                  className="bg-black border-white/20 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-white/70 text-xs">Category Tag</Label>
                                <Input
                                  defaultValue={item.category}
                                  onBlur={(e) => handleUpdate(item.id, { category: e.target.value })}
                                  className="bg-black border-white/20 text-white uppercase text-xs"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-white/70 text-xs">Description</Label>
                            <Textarea
                              defaultValue={item.description}
                              onBlur={(e) => handleUpdate(item.id, { description: e.target.value })}
                              className="bg-black border-white/20 text-white resize-none h-20"
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            No events created yet. Click &quot;Add Event&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
