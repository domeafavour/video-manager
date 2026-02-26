import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
          <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/5 rounded-md">
              <img
                src={`file://${resource.path}`}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
