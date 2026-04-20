'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dispatch, SetStateAction } from 'react';
import { Spinner } from '../ui/spinner';

type DeleteConfirmationDialogProps = {
  showDeleteConfirmationDialog: boolean;
  setShowDeleteConfirmationDialog: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  isDeleting: boolean;
  handleDelete: () => void;
};

export function DeleteConfirmationDialog({
  showDeleteConfirmationDialog,
  setShowDeleteConfirmationDialog,
  title = 'Are you sure?',
  description,
  isDeleting,
  handleDelete,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog
      open={showDeleteConfirmationDialog}
      onOpenChange={setShowDeleteConfirmationDialog}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner size="sm" className="mr-1.5" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
