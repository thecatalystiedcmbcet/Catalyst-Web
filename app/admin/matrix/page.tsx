"use client";

import { useEffect, useState } from "react";
import { useAdminStore, MatrixItem } from "@/lib/adminStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical, Save, Loader2, SaveAll } from "lucide-react";
import { toast } from "sonner";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

export default function MatrixAdminPage() {
  const {
    matrixItems,
    fetchMatrixItems,
    addMatrixItem,
    updateMatrixItem,
    deleteMatrixItem,
    reorderMatrixItems,
    isLoadingMatrix,
  } = useAdminStore();

  const [isSaving, setIsSaving] = useState(false);
  const [localItems, setLocalItems] = useState<MatrixItem[]>([]);

  useEffect(() => {
    fetchMatrixItems();
  }, [fetchMatrixItems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors store data into a locally reorderable copy for drag-and-drop
    setLocalItems([...matrixItems].sort((a, b) => a.sort_order - b.sort_order));
  }, [matrixItems]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalItems(items);
    
    try {
      await reorderMatrixItems(items);
      toast.success("Order updated successfully!");
    } catch {
      toast.error("Failed to update order");
      setLocalItems(matrixItems); // Revert on failure
    }
  };

  const handleUpdate = async (id: string, updates: Partial<MatrixItem>) => {
    try {
      await updateMatrixItem(id, updates);
      toast.success("Saved!");
    } catch (error) {
      toast.error("Failed to save updates");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stat?")) return;
    try {
      await deleteMatrixItem(id);
      toast.success("Stat deleted!");
    } catch (error) {
      toast.error("Failed to delete stat");
    }
  };

  const handleAddNew = async () => {
    try {
      await addMatrixItem({
        value: 0,
        suffix: "+",
        label: "New Stat",
        sort_order: localItems.length,
      });
      toast.success("New stat added!");
    } catch (error) {
      toast.error("Failed to add new stat");
    }
  };

  if (isLoadingMatrix && matrixItems.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Catalyst Matrix</h1>
          <p className="text-muted-foreground mt-2">
            Manage the statistics shown on the homepage matrix section.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-white text-black hover:bg-gray-200">
          <Plus className="mr-2 h-4 w-4" /> Add Stat
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-sm">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="matrix-list">
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
                        className="flex items-center gap-4 bg-black/40 border border-white/10 p-4 rounded-lg"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab text-white/30 hover:text-white/70"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white/70 text-xs">Value (Number)</Label>
                            <Input
                              type="number"
                              defaultValue={item.value}
                              onBlur={(e) => handleUpdate(item.id, { value: Number(e.target.value) })}
                              className="bg-black border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/70 text-xs">Suffix (e.g. +, %)</Label>
                            <Input
                              defaultValue={item.suffix}
                              onBlur={(e) => handleUpdate(item.id, { suffix: e.target.value })}
                              className="bg-black border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/70 text-xs">Label</Label>
                            <Input
                              defaultValue={item.label}
                              onBlur={(e) => handleUpdate(item.id, { label: e.target.value })}
                              className="bg-black border-white/20 text-white"
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 self-end mb-0.5"
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
            No stats created yet. Click &quot;Add Stat&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
