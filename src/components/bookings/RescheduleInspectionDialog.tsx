import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from "@/components/ui/responsive-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  mode: z.string().min(1, "Inspection mode is required"),
  date: z.date({
    required_error: "New date is required",
  }),
  time: z.string().min(1, "Preferred time is required"),
  reason: z.string().optional(),
});

interface RescheduleInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (rescheduleData: any) => void;
  currentInspection: any;
}

export function RescheduleInspectionDialog({
  open,
  onOpenChange,
  onConfirm,
  currentInspection,
}: RescheduleInspectionDialogProps) {
  const [loading, setLoading] = useState(false);

  // Parse date and time from currentInspection.when
  let defaultDate: Date | undefined = undefined;
  let defaultTime = "";
  if (currentInspection?.when) {
    const dt = new Date(currentInspection.when);
    defaultDate = dt;
    // Format as "HH:mm"
    defaultTime = dt.toISOString().slice(11, 16);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: currentInspection?.mode || "",
      date: defaultDate,
      time: defaultTime,
      reason: "",
    },
  });

  // If the inspection changes while the dialog is open, reset the form
  useEffect(() => {
    if (open && currentInspection) {
      let newDate: Date | undefined = undefined;
      let newTime = "";
      if (currentInspection.when) {
        const dt = new Date(currentInspection.when);
        newDate = dt;
        newTime = dt.toISOString().slice(11, 16);
      }
      form.reset({
        mode: currentInspection.mode || "",
        date: newDate,
        time: newTime,
        reason: "",
      });
    }
    // eslint-disable-next-line
  }, [open, currentInspection]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const rescheduleDateTime = new Date(values.date);
      const [hours, minutes] = values.time.split(":");
      rescheduleDateTime.setHours(parseInt(hours), parseInt(minutes));

      const rescheduleData = {
        inspectionId: currentInspection.id,
        newDateTime: rescheduleDateTime.toISOString(),
        mode: values.mode,
        reason: values.reason,
        rescheduledAt: new Date().toISOString(),
      };

      await onConfirm(rescheduleData);
      form.reset();
    } catch (error) {
      console.error("Error rescheduling inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Reschedule Inspection</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="px-4 md:px-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inspection type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">
                          Physical Inspection
                        </SelectItem>
                        <SelectItem value="virtual">Virtual Tour</SelectItem>
                        <SelectItem value="video_call">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>New Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          autoFocus
                          className="w-full"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for rescheduling (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Why do you need to reschedule?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={loading}>
            {loading ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
