import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertLogEntrySchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Radio, 
  Image, 
  Mic, 
  Save, 
  X, 
  FileText, 
  Power, 
  Star, 
  MessageSquare, 
  Check 
} from 'lucide-react';

// Extend the LogEntry schema with additional fields
const formSchema = insertLogEntrySchema.extend({
  mode: z.string().optional(),
  band: z.string().optional(),
  power: z.number().optional(),
  photoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  qslSent: z.boolean().default(false),
  qslReceived: z.boolean().default(false),
  favorite: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface EnhancedLogEntryFormProps {
  onCancel: () => void;
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export default function EnhancedLogEntryForm({ 
  onCancel, 
  initialData, 
  isEdit = false,
  onSuccess
}: EnhancedLogEntryFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
  const [audioPreview, setAudioPreview] = useState<string | null>(initialData?.audioUrl || null);
  
  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateTime: initialData?.dateTime || new Date().toISOString(),
      frequency: initialData?.frequency || 146.52,
      callSign: initialData?.callSign || '',
      operatorName: initialData?.operatorName || '',
      location: initialData?.location || '',
      signalReport: initialData?.signalReport || '',
      notes: initialData?.notes || '',
      mode: initialData?.mode || 'FM',
      band: initialData?.band || '2m',
      power: initialData?.power || 5,
      photoUrl: initialData?.photoUrl || '',
      audioUrl: initialData?.audioUrl || '',
      qslSent: initialData?.qslSent || false,
      qslReceived: initialData?.qslReceived || false,
      favorite: initialData?.favorite || false,
    }
  });

  // Create a new log entry
  const createMutation = {
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest('/api/logEntries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Log entry created successfully',
      });
      if (onSuccess) onSuccess();
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create log entry: ${error.message}`,
        variant: 'destructive',
      });
    },
  };

  // Update an existing log entry
  const updateMutation = {
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest(`/api/logEntries/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Log entry updated successfully',
      });
      if (onSuccess) onSuccess();
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update log entry: ${error.message}`,
        variant: 'destructive',
      });
    },
  };

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutationFn(values)
        .then(updateMutation.onSuccess)
        .catch(updateMutation.onError);
    } else {
      createMutation.mutationFn(values)
        .then(createMutation.onSuccess)
        .catch(createMutation.onError);
    }
  };

  // Handle photo upload (simulation - in a real app this would upload to storage)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage and get URL
      // For now, we'll use a data URL for demonstration
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPhotoPreview(dataUrl);
        form.setValue('photoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle audio recording (simulation - in a real app this would upload to storage)
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage and get URL
      // For now, we'll use a data URL for demonstration
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAudioPreview(dataUrl);
        form.setValue('audioUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-1">
              <Radio className="h-3.5 w-3.5" />
              <span>Basic</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1">
              <Image className="h-3.5 w-3.5" />
              <span>Media</span>
            </TabsTrigger>
            <TabsTrigger value="qsl" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>QSL</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} 
                        value={new Date(field.value).toISOString().slice(0, 16)}
                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                      />
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
                      <Input type="number" step="0.001" {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="callSign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call Sign</FormLabel>
                  <FormControl>
                    <Input {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())} 
                      placeholder="e.g. VA7HAM"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="operatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. John Doe" />
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
                      <Input {...field} placeholder="e.g. Powell River, BC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="signalReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signal Report</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select signal report" />
                      </SelectTrigger>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FM">FM</SelectItem>
                          <SelectItem value="SSB">SSB</SelectItem>
                          <SelectItem value="CW">CW</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="DIGITAL">Digital</SelectItem>
                          <SelectItem value="FT8">FT8</SelectItem>
                          <SelectItem value="FT4">FT4</SelectItem>
                          <SelectItem value="RTTY">RTTY</SelectItem>
                          <SelectItem value="PSK31">PSK31</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="band"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Band</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select band" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="160m">160m</SelectItem>
                          <SelectItem value="80m">80m</SelectItem>
                          <SelectItem value="40m">40m</SelectItem>
                          <SelectItem value="30m">30m</SelectItem>
                          <SelectItem value="20m">20m</SelectItem>
                          <SelectItem value="17m">17m</SelectItem>
                          <SelectItem value="15m">15m</SelectItem>
                          <SelectItem value="12m">12m</SelectItem>
                          <SelectItem value="10m">10m</SelectItem>
                          <SelectItem value="6m">6m</SelectItem>
                          <SelectItem value="2m">2m</SelectItem>
                          <SelectItem value="70cm">70cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="power"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power (Watts)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
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
                      placeholder="Any additional notes about this contact"
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="favorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Mark as Favorite Contact
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Highlight this QSO as a special contact in your logbook
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="media" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="font-medium flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span>Photo Attachment</span>
                  </div>
                  
                  {photoPreview ? (
                    <div className="relative">
                      <img 
                        src={photoPreview} 
                        alt="Contact photo" 
                        className="w-full h-auto rounded-md object-cover max-h-[200px]" 
                      />
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="absolute top-2 right-2 w-8 h-8 p-0"
                        onClick={() => {
                          setPhotoPreview(null);
                          form.setValue('photoUrl', '');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-700 rounded-md p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">Upload a photo of your QSO</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload">
                        <Button type="button" variant="outline" className="mt-2">
                          Select Photo
                        </Button>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span>Audio Recording</span>
                  </div>
                  
                  {audioPreview ? (
                    <div className="relative">
                      <audio 
                        src={audioPreview} 
                        controls 
                        className="w-full" 
                      />
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="absolute top-2 right-2 w-8 h-8 p-0"
                        onClick={() => {
                          setAudioPreview(null);
                          form.setValue('audioUrl', '');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-700 rounded-md p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">Upload an audio recording</p>
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label htmlFor="audio-upload">
                        <Button type="button" variant="outline" className="mt-2">
                          Select Audio
                        </Button>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-md bg-gray-800 p-3 text-xs text-gray-400">
              <p>Tip: Adding media to your contacts helps you remember these special QSOs. Photos of QSL cards, station setups, or audio recordings of the actual contact can be valuable for your collection.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="qsl" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="qslSent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">QSL Sent</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Have you sent a QSL card?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="qslReceived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">QSL Received</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Have you received a QSL card?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="rounded-md bg-blue-900/20 border border-blue-800 p-4">
              <h4 className="font-medium text-blue-300 flex items-center mb-2">
                <Check className="h-4 w-4 mr-2" />
                QSL Information
              </h4>
              <p className="text-sm text-gray-300">
                QSL cards are the traditional way of confirming a two-way radio contact. They serve as a physical record of your radio contacts and can be collected for various awards.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-800 rounded-md flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>QSL Sent: {form.watch('qslSent') ? 'Yes' : 'No'}</span>
                </div>
                <div className="p-2 bg-gray-800 rounded-md flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>QSL Received: {form.watch('qslReceived') ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between pt-4 border-t border-gray-800">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  const tabs = ['basic', 'details', 'media', 'qsl'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
            
            {activeTab !== 'qsl' ? (
              <Button 
                type="button" 
                onClick={() => {
                  const tabs = ['basic', 'details', 'media', 'qsl'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>{isEdit ? 'Update' : 'Save'} Log Entry</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}