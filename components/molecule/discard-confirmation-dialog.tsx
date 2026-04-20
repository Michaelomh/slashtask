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

type DiscardConfirmationDialogProps = {
  showDiscardConfirmationDialog: boolean;
  setShowDiscardConfirmationDialog: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  handleClose: () => void;
};

export function DiscardConfirmationDialog({
  showDiscardConfirmationDialog,
  setShowDiscardConfirmationDialog,
  title = 'Discard changes?',
  description = 'You have unsaved changes. Are you sure you want to discard them?',
  handleClose,
}: DiscardConfirmationDialogProps) {
  return (
    <AlertDialog
      open={showDiscardConfirmationDialog}
      onOpenChange={setShowDiscardConfirmationDialog}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">Keep editing</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={handleClose}
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
