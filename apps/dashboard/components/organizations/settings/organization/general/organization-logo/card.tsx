"use client";

import * as React from "react";
import NiceModal from "@ebay/nice-modal-react";
import { TrashIcon, UploadIcon } from "lucide-react";
import { type SubmitHandler } from "react-hook-form";

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Form } from "@workspace/ui/components/form";
import { ImageDropzone } from "@workspace/ui/components/image-dropzone";
import { toast } from "@workspace/ui/components/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useZodForm } from "~/hooks/use-zod-form";
import { MAX_IMAGE_SIZE } from "~/lib/file-upload";
import {
  updateOrganizationLogoSchema,
  type UpdateOrganizationLogoSchema,
} from "~/schemas/organization/update-organization-logo-schema";
import { createClient } from "@workspace/database/client";
import { CropPhotoModal } from "~/components/common/modals/profile/crop-photo-modal";

interface OrganizationLogoCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  logo?: string;
}

export function OrganizationLogoCard({
  logo: initialLogo,
  ...props
}: OrganizationLogoCardProps): React.JSX.Element {
  const [imagePath, setImagePath] = React.useState<string | null>(null);
  const methods = useZodForm({
    schema: updateOrganizationLogoSchema,
    mode: "onSubmit",
    defaultValues: {
      logo: initialLogo,
    },
  });
  const logo = methods.watch("logo");
  const supabase = createClient();

  const handleDrop = async (files: File[]): Promise<void> => {
    if (files && files.length > 0) {
      const file = files[0];

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          `Uploaded image shouldn't exceed ${MAX_IMAGE_SIZE / 1000000} MB size limit`
        );
      } else {
        const base64Image: string = await NiceModal.show(CropPhotoModal, {
          file,
          aspectRatio: 1,
          circularCrop: false,
        });

        if (base64Image) {
          const fileExt = file.name.split(".").pop();
          const filePath = `${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("logos")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("logos").getPublicUrl(filePath);

          setImagePath(filePath);

          methods.setValue("logo", publicUrl, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    }
  };

  const handleRemoveLogo = async (): Promise<void> => {
    if (imagePath === null) return;

    const { error } = await supabase.storage.from("logos").remove([imagePath]);

    if (error) throw error;

    setImagePath(null);

    methods.setValue("logo", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const canSubmit = !methods.formState.isSubmitting;
  const onSubmit: SubmitHandler<UpdateOrganizationLogoSchema> = async (
    values
  ) => {
    if (!canSubmit) return;
  };

  return (
    <Form {...methods}>
      <Card {...props}>
        <CardContent className="pt-6">
          <form
            className="flex items-center space-x-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="relative">
              <ImageDropzone
                accept={{ "image/*": [] }}
                onDrop={handleDrop}
                src={logo}
                borderRadius="xl"
                className="size-20 rounded-xl p-0.5"
              >
                <Avatar className="size-[72px] rounded-md">
                  <AvatarFallback className="size-[72px] rounded-md text-2xl">
                    <UploadIcon className="size-5 shrink-0 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              </ImageDropzone>
              {!!logo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute bottom-[-12px] right-[-12px] z-10 rounded-full bg-background p-1"
                      onClick={handleRemoveLogo}
                    >
                      <TrashIcon className="size-4 shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Remove logo</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm">Upload your logo</span>
              <span className="text-xs text-muted-foreground">
                *.png, *.jpeg files up to 5 MB
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}
