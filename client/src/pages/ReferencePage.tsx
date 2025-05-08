import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ReferenceItem from "@/components/reference/ReferenceItem";
import { ReferenceItem as ReferenceItemType } from "@shared/schema";

const ReferencePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: referenceItems = [], isLoading } = useQuery<ReferenceItemType[]>({
    queryKey: ["/api/reference"],
  });

  const filterItems = (items: ReferenceItemType[]) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.filter((item) => {
      return searchTerm === "" || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const filteredItems = filterItems(referenceItems);
  
  // Group items by category
  const groupedItems = filteredItems.reduce((acc: Record<string, any[]>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  // Sort categories with Emergency Protocols always first
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === "Emergency Protocols") return -1;
    if (b === "Emergency Protocols") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">Ham Radio Reference Guide</h1>
      <p className="text-muted-foreground mb-6">Essential information for ham radio operators organized by topic</p>
      
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        {/* Search */}
        <div className="mb-6">
          <Input 
            type="text" 
            placeholder="Search reference materials..." 
            className="w-full text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Reference Categories */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <Skeleton className="h-10 w-full mb-3 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-8">
            {sortedCategories.map(category => (
              <div key={category}>
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">{category}</h2>
                <div className="space-y-4">
                  {groupedItems[category].map(item => (
                    <ReferenceItem 
                      key={item.id} 
                      item={item} 
                      isEmergency={category === "Emergency Protocols"} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-lg text-gray-500">No reference items found matching your search.</p>
            <p className="text-sm text-muted-foreground mt-2">Try different search terms or clear your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferencePage;
