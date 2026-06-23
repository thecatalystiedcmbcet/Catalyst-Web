"use client";

import { useEffect, useState } from "react";
import { useAdminStore, CampusStatistic } from "@/lib/adminStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

export default function CampusStatisticsAdminPage() {
  const {
    campusStatistics,
    fetchCampusStatistics,
    addCampusStatistic,
    updateCampusStatistic,
    deleteCampusStatistic,
    reorderCampusStatistics,
    isLoadingCampusStatistics,
  } = useAdminStore();

  const [localItems, setLocalItems] = useState<CampusStatistic[]>([]);

  useEffect(() => {
    fetchCampusStatistics();
  }, [fetchCampusStatistics]);

  useEffect(() => {
    setLocalItems(campusStatistics.sort((a, b) => a.sort_order - b.sort_order));
  }, [campusStatistics]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalItems(items);
    
    try {
      await reorderCampusStatistics(items);
      toast.success("Order updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update order");
      setLocalItems(campusStatistics); // Revert on failure
    }
  };

  const handleUpdate = async (id: string, updates: Partial<CampusStatistic>) => {
    try {
      await updateCampusStatistic(id, updates);
      toast.success("Saved!");
    } catch (error) {
      toast.error("Failed to save updates");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stat?")) return;
    try {
      await deleteCampusStatistic(id);
      toast.success("Stat deleted!");
    } catch (error) {
      toast.error("Failed to delete stat");
    }
  };

  const handleAddNew = async () => {
    try {
      await addCampusStatistic({
        value: "0",
        title: "NEW STAT TITLE",
        description: "New stat description",
        sort_order: localItems.length,
      });
      toast.success("New stat added!");
    } catch (error) {
      toast.error("Failed to add new stat");
    }
  };

  if (isLoadingCampusStatistics && campusStatistics.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Campus Statistics</h1>
          <p className="text-white/50 mt-2">
            Manage the µLearn statistics shown on the landing page timeline.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-white text-black hover:bg-white/90">
          <Plus className="mr-2 h-4 w-4" /> Add Stat
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0E0E0E] p-6 shadow-sm">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="campus-stats-list">
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
                        className="flex items-start md:items-center gap-4 bg-[#141414] border border-white/10 p-4 rounded-lg flex-col md:flex-row relative group"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab text-white/30 hover:text-white/70 absolute top-4 left-4 md:static"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full pl-8 md:pl-0">
                          <div className="space-y-2">
                            <Label className="text-white/70 text-xs">Value (e.g. 20,00,000+)</Label>
                            <Input
                              type="text"
                              defaultValue={item.value}
                              onBlur={(e) => handleUpdate(item.id, { value: e.target.value })}
                              className="bg-[#1C1C1C] border-white/10 text-white focus-visible:ring-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/70 text-xs">Title (e.g. KARMA POINTS MINED)</Label>
                            <Input
                              type="text"
                              defaultValue={item.title}
                              onBlur={(e) => handleUpdate(item.id, { title: e.target.value })}
                              className="bg-[#1C1C1C] border-white/10 text-white focus-visible:ring-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/70 text-xs">Description</Label>
                            <Input
                              type="text"
                              defaultValue={item.description}
                              onBlur={(e) => handleUpdate(item.id, { description: e.target.value })}
                              className="bg-[#1C1C1C] border-white/10 text-white focus-visible:ring-white/20"
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-white/30 hover:text-red-400 hover:bg-red-500/10 self-end md:self-auto absolute top-2 right-2 md:static transition-colors"
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
            No statistics configured. Click "Add Stat" to create your first one.
          </div>
        )}
      </div>
    </div>
  );
}
