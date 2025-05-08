import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertLogEntrySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { useToast } from "@/hooks/use-toast";

interface LogEntryFormProps {
  onCancel: () => void;
  initialData?: any;
  isEdit?: boolean;
}

const LogEntryForm: React.FC<LogEntryFormProps> = ({ 
  onCancel, 
  initialData = null, 
  isEdit = false 
}) => {
  const { toast } = useToast();

  // Extend the schema with validation
  const formSchema = insertLogEntrySchema.extend({
    dateTime: z.string().min(1, "Date and time are required"),
    frequency: z.coerce.number().min(0.1, "Frequency must be positive"),
    callSign: z.string().min(1, "Call sign is required"),
    operatorName: z.string().optional(),
    location: z.string().optional(),
    signalReport: z.string().optional(),
    notes: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Set default values
  const defaultValues: Partial<FormValues> = {
    dateTime: initialData?.dateTime 
      ? new Date(initialData.dateTime).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16),
    frequency: initialData?.frequency || "",
    callSign: initialData?.callSign || "",
    operatorName: initialData?.operatorName || "",
    location: initialData?.location || "",
    signalReport: initialData?.signalReport || "59",
    notes: initialData?.notes || "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { mutate: saveLogEntry, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const endpoint = isEdit 
        ? `/api/logbook/${initialData.id}` 
        : "/api/logbook";
      
      const method = isEdit ? "PATCH" : "POST";
      
      const dateTimeValue = values.dateTime 
        ? new Date(values.dateTime).toISOString() 
        : new Date().toISOString();
      
      const data = {
        ...values,
        dateTime: dateTimeValue,
      };
      
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logbook"] });
      toast({
        title: isEdit ? "Log entry updated" : "Log entry saved",
        description: isEdit 
          ? "Your log entry has been updated successfully." 
          : "Your new log entry has been saved.",
      });
      onCancel();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "save"} log entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    saveLogEntry(values);
  };

  return (
    <div className="mb-4 bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-bold mb-2">{isEdit ? "Edit Contact" : "New Contact"}</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
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
                  <FormLabel>Frequency (MHz)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.001" 
                      placeholder="146.840" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="callSign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call Sign</FormLabel>
                  <FormControl>
                    <Input placeholder="VE7XXX" {...field} />
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
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
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
                    <Input placeholder="Powell River, BC" {...field} />
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
                      <SelectItem value="59">5-9 (Excellent)</SelectItem>
                      <SelectItem value="58">5-8 (Very Good)</SelectItem>
                      <SelectItem value="57">5-7 (Good)</SelectItem>
                      <SelectItem value="56">5-6 (Good with Noise)</SelectItem>
                      <SelectItem value="55">5-5 (Fair)</SelectItem>
                      <SelectItem value="54">5-4 (Fair with Noise)</SelectItem>
                      <SelectItem value="53">5-3 (Readable with Difficulty)</SelectItem>
                      <SelectItem value="52">5-2 (Barely Readable)</SelectItem>
                      <SelectItem value="51">5-1 (Unreadable)</SelectItem>
                    </SelectContent>
                  </Select>
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
                    rows={3} 
                    placeholder="Enter any additional notes about the contact" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex space-x-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Entry"}
            </Button>
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LogEntryForm;
