"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import PhoneInput from "react-phone-number-input/react-hook-form-input";
import { type SubmitHandler } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query";
import { MediaQueries } from "@workspace/ui/lib/media-queries";
import { cn } from "@workspace/ui/lib/utils";

import { addContact } from "~/actions/contacts/add-contact";
import { useEnhancedModal } from "~/hooks/use-enhanced-modal";
import { useZodForm } from "~/hooks/use-zod-form";
import {
  addContactSchema,
  type AddContactSchema,
} from "~/schemas/contacts/add-contact-schema";
import { ContactStage } from "@workspace/database/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { contactStageColor } from "./contact-stage-color";
import { contactStageLabel } from "~/lib/labels";

export type AddContactModalProps = NiceModalHocProps;

export const AddContactModal = NiceModal.create<AddContactModalProps>(() => {
  const modal = useEnhancedModal();
  const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
  const methods = useZodForm({
    schema: addContactSchema,
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      stage: ContactStage.ACTIVE,
    },
  });
  const title = "Add contact";
  const description = "Create a new contact by filling out the form below.";
  const canSubmit =
    !methods.formState.isSubmitting &&
    (!methods.formState.isSubmitted || methods.formState.isDirty);
  const onSubmit: SubmitHandler<AddContactSchema> = async (values) => {
    if (!canSubmit) {
      return;
    }
    const result = await addContact(values);
    if (!result?.serverError && !result?.validationErrors) {
      toast.success("Contact added");
      modal.handleClose();
    } else {
      toast.error("Couldn't add contact");
    }
  };
  const renderForm = (
    <form
      className={cn("space-y-4", !mdUp && "p-4")}
      onSubmit={methods.handleSubmit(onSubmit)}
    >
      <FormField
        control={methods.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormLabel required>Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                maxLength={64}
                required
                disabled={methods.formState.isSubmitting}
                {...field}
              />
            </FormControl>
            {(methods.formState.touchedFields.name ||
              methods.formState.submitCount > 0) && <FormMessage />}
          </FormItem>
        )}
      />
      <FormField
        name="stage"
        control={methods.control}
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormLabel required>Stage</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (value !== field.value) {
                    field.onChange(value);
                    onSubmit(methods.getValues());
                  }
                }}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ContactStage).map((value: ContactStage) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex flex-row items-center gap-2">
                        <div
                          className={cn(
                            "size-2.5 rounded-full border-2 bg-background",
                            contactStageColor[value]
                          )}
                        />
                        {contactStageLabel[value]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={methods.control}
        name="email"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                maxLength={255}
                disabled={methods.formState.isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={methods.control}
        name="phone"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input
                type="tel"
                maxLength={32}
                disabled={methods.formState.isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  );
  const renderButtons = (
    <>
      <Button type="button" variant="outline" onClick={modal.handleClose}>
        Cancel
      </Button>
      <Button
        type="button"
        variant="default"
        disabled={!canSubmit}
        loading={methods.formState.isSubmitting}
        onClick={methods.handleSubmit(onSubmit)}
      >
        Save
      </Button>
    </>
  );
  return (
    <Form {...methods}>
      {mdUp ? (
        <Dialog open={modal.visible}>
          <DialogContent
            className="max-w-sm"
            onClose={modal.handleClose}
            onAnimationEndCapture={modal.handleAnimationEndCapture}
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="sr-only">
                {description}
              </DialogDescription>
            </DialogHeader>
            {renderForm}
            <DialogFooter>{renderButtons}</DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={modal.visible} onOpenChange={modal.handleOpenChange}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription className="sr-only">
                {description}
              </DrawerDescription>
            </DrawerHeader>
            {renderForm}
            <DrawerFooter className="flex-col-reverse pt-4">
              {renderButtons}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </Form>
  );
});
