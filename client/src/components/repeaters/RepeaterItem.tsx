import { useState } from "react";
import { Repeater } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusCircle, Map } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RepeaterItemProps {
  repeater: Repeater;
  onAddToScanner: (frequency: number) => void;
}

const RepeaterItem: React.FC<RepeaterItemProps> = ({ repeater, onAddToScanner }) => {
  return (
    <Accordion type="single" collapsible className="mb-4">
      <AccordionItem value={`repeater-${repeater.id}`} className="border rounded-lg overflow-hidden">
        <AccordionTrigger className="bg-primary text-white p-3 flex justify-between items-center hover:no-underline">
          <h3 className="font-bold text-left">{repeater.name}</h3>
        </AccordionTrigger>
        <AccordionContent className="p-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-sm text-gray-500">Frequency:</p>
              <p className="font-medium">{repeater.frequency.toFixed(3)} MHz</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Offset:</p>
              <p className="font-medium">{repeater.offset > 0 ? "+" : ""}{repeater.offset.toFixed(3)} MHz</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tone:</p>
              <p className="font-medium">{repeater.tone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status:</p>
              <p className={`font-medium ${
                repeater.status === "operational" ? "text-success" :
                repeater.status === "intermittent" ? "text-warning" :
                "text-destructive"
              }`}>
                {repeater.status.charAt(0).toUpperCase() + repeater.status.slice(1)}
              </p>
            </div>
          </div>
          
          {repeater.location && (
            <div className="mb-3">
              <p className="text-sm text-gray-500">Location:</p>
              <p className="font-medium">{repeater.location}</p>
            </div>
          )}
          
          {repeater.coverage && (
            <div className="mb-3">
              <p className="text-sm text-gray-500">Coverage:</p>
              <p className="font-medium">{repeater.coverage}</p>
            </div>
          )}
          
          {repeater.notes && (
            <div className="mb-3">
              <p className="text-sm text-gray-500">Notes:</p>
              <p className="font-medium">{repeater.notes}</p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="bg-accent text-white" 
              onClick={() => onAddToScanner(repeater.frequency)}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add to Scanner
            </Button>
            
            {(repeater.latitude && repeater.longitude) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(`https://maps.google.com/?q=${repeater.latitude},${repeater.longitude}`, '_blank')}
              >
                <Map className="h-4 w-4 mr-1" />
                Directions
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RepeaterItem;
