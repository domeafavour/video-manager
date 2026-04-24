import {
  Dialog,
  DialogHeader,
} from "@/components/ui/dialog";
import { VmDialogContent, VmTitle } from "@/components/ui/vm";
import { MaterialEntity } from "@/typings";
import { isImage, isVideo } from "@/utils/file-type";
import { useDisclosure } from "@domeadev/react-disclosure";
import { Slot, SlotProps } from "@radix-ui/react-slot";
import { VideoPreviewDialog } from "./VideoPreviewDialog";

interface Props extends Omit<SlotProps, "resource"> {
  resource: MaterialEntity;
}

export type PreviewResourceProps = Props;

export function PreviewResource({ resource, children, ...props }: Props) {
  const [open, toggleOpen] = useDisclosure();

  return (
    <>
      <Slot
        onClick={() => {
          toggleOpen(true);
        }}
        {...props}
      >
        {children}
      </Slot>
      {isVideo(resource.path) ? (
        <VideoPreviewDialog
          open={open}
          onOpenChange={toggleOpen}
          resourceId={resource.id}
          resourcePath={resource.path}
          initialTags={resource.tags ?? []}
        />
      ) : null}
      {isImage(resource.path) ? (
        <Dialog open={open} onOpenChange={toggleOpen}>
          <VmDialogContent className="flex h-[80vh] w-full max-w-4xl flex-col rounded-[28px]">
            <DialogHeader>
              <VmTitle as="h2" className="text-[24px]">
                Preview
              </VmTitle>
            </DialogHeader>
            <div className="flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-[rgba(214,174,102,0.12)] bg-[rgba(0,0,0,0.18)]">
              <img
                src={`file://${resource.path}`}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </VmDialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
