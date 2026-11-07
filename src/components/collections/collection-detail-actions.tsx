"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { Button } from "@/components/ui/button";

export function CollectionDetailActions({
  collectionId,
  name,
  description,
  isFavorite,
}: {
  collectionId: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Favorite">
          <Star
            className={
              isFavorite ? "fill-current text-[#fde047]" : undefined
            }
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Edit"
          onClick={() => setEditOpen(true)}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Delete"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 />
        </Button>
      </div>

      <EditCollectionDialog
        collectionId={collectionId}
        name={name}
        description={description}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteCollectionDialog
        collectionId={collectionId}
        name={name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectTo="/collections"
      />
    </>
  );
}
