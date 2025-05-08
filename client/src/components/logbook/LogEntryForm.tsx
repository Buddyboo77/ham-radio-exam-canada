import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { SIGNAL_REPORT_OPTIONS } from "@/lib/constants";
import { insertLogEntrySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend the schema with additional validation
const formSchema = insertLogEntrySchema.extend({
  dateTime: z.union([z.string(), z.date()]),
  callSign: z.string().min(3, "Call sign must be at least 3 characters"),
  frequency: z.number().min(0.1, "Frequency must be greater than 0.1 MHz"),
});

type FormValues = z.infer<typeof formSchema>;

interface LogEntryFormProps {
  onCancel: () => void;
  initialData?: any;
  isEdit?: boolean;
}

const LogEntryForm: React.FC<LogEntryFormProps> = ({ 
  onCancel, 
  initialData, 
  isEdit = false 
}) => {
  const [date, setDate] = useState<Date | undefined>(
    initialData?.dateTime ? new Date(initialData.dateTime) : new Date()
  );
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      callSign: initialData?.callSign || "",
      frequency: initialData?.frequency || "",
      operatorName: initialData?.operatorName || "",
      location: initialData?.location || "",
      signalReport: initialData?.signalReport || "",
      notes: initialData?.notes || "",
      dateTime: initialData?.dateTime ? new Date(initialData.dateTime) : new Date(),
    },
  });

  const { mutate: createLogEntry, isPending: isCreating } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/logbook",
        values
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logbook"] });
      toast({
        title: "Log Entry Created",
        description: "The log entry has been successfully created.",
      });
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create log entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const { mutate: updateLogEntry, isPending: isUpdating } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest(
        "PATCH",
        `/api/logbook/${initialData.id}`,
        values
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logbook"] });
      toast({
        title: "Log Entry Updated",
        description: "The log entry has been successfully updated.",
      });
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update log entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    // Ensure dateTime is formatted correctly
    const formattedValues = {
      ...values,
      dateTime: values.dateTime instanceof Date ? values.dateTime : new Date(values.dateTime),
      frequency: Number(values.frequency),
    };

    if (isEdit && initialData?.id) {
      updateLogEntry(formattedValues);
    } else {
      createLogEntry(formattedValues);
    }
  };

  useEffect(() => {
    if (date) {
      form.setValue("dateTime", date);
    }
  }, [date, form]);

  const isPending = isCreating || isUpdating;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">
          {isEdit ? "Edit Log Entry" : "Add New Log Entry"}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          type="button"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="callSign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call Sign*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. VE7ABC" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operatorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. John Smith" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency (MHz)*</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.001" 
                      min="0.1" 
                      placeholder="146.840"
                      onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signalReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signal Report</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select signal report" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SIGNAL_REPORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Standard RST or RS format
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Powell River" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {date ? (
                            format(date, "PPP p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <Input
                          type="time"
                          value={date ? format(date, "HH:mm") : ""}
                          onChange={e => {
                            if (date && e.target.value) {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(date);
                              newDate.setHours(hours, minutes);
                              setDate(newDate);
                            }
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Add any details about the contact" 
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <span>Saving...</span>
              ) : isEdit ? (
                "Update Entry"
              ) : (
                "Add Entry"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LogEntryForm;