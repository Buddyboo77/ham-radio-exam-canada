import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ReferenceItem from "@/components/reference/ReferenceItem";

const ReferencePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: referenceItems, isLoading } = useQuery({
    queryKey: ["/api/reference"],
  });

  const filterItems = (items: any[] | undefined) => {
    if (!items) return [];
    
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
    <div className="p-4">
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <h2 className="font-bold text-lg mb-4">Ham Radio Reference Guide</h2>
        
        {/* Search */}
        <div className="mb-4">
          <Input 
            type="text" 
            placeholder="Search reference materials..." 
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Reference Categories */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <Skeleton className="h-10 w-full mb-2 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-4">
            {sortedCategories.map(category => (
              <div key={category}>
                <h3 className="font-semibold mb-2 text-gray-700">{category}</h3>
                <div className="space-y-3">
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
          <div className="text-center py-8">
            <p>No reference items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferencePage;
