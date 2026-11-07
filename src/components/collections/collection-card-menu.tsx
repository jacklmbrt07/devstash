"use client";

import { useState } from "react";
import { EllipsisVertical, Pencil, Star, Trash2 } from "lucide-react";

import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CollectionCardMenu({
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Collection actions"
              className="bg-background/80 text-muted-foreground shadow-sm hover:text-foreground"
            />
          }
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-40"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <DropdownMenuItem
            onClick={() => {
              setEditOpen(true);
            }}
          >
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Star
              className={
                isFavorite ? "fill-current text-[#fde047]" : undefined
              }
            />
            Favorite
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setDeleteOpen(true);
            }}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
      />
    </>
  );
}
