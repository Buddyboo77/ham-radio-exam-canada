import { ReferenceItem as ReferenceItemType } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ReferenceItemProps {
  item: ReferenceItemType;
  isEmergency?: boolean;
}

const ReferenceItem: React.FC<ReferenceItemProps> = ({ item, isEmergency = false }) => {
  const formatDescription = (description: string) => {
    // Split by newlines and render as paragraphs or lists
    return description.split('\n').map((line, index) => {
      // Check if the line starts with a number or bullet
      if (/^\d+\./.test(line)) {
        // This is likely a numbered list item
        return (
          <li key={index} className="ml-5">
            {line}
          </li>
        );
      } else if (/^[•\-\*]/.test(line)) {
        // This is likely a bullet list item
        return (
          <li key={index} className="ml-5">
            {line.substring(1).trim()}
          </li>
        );
      } else {
        // Regular paragraph
        return <p key={index}>{line}</p>;
      }
    });
  };

  return (
    <Accordion type="single" collapsible className="mb-3">
      <AccordionItem 
        value={`ref-${item.id}`} 
        className="border rounded-lg overflow-hidden"
      >
        <AccordionTrigger 
          className={`p-3 flex justify-between items-center hover:no-underline ${
            isEmergency ? "bg-secondary text-white" : "bg-primary text-white"
          }`}
        >
          <h3 className="font-bold text-left">{item.title}</h3>
        </AccordionTrigger>
        <AccordionContent className="p-4">
          <div className="prose prose-sm max-w-none">
            {formatDescription(item.description)}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ReferenceItem;
