import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Book, Radio } from "lucide-react";
import ReferenceItem from "@/components/reference/ReferenceItem";
import ClubInfoCard from "@/components/reference/ClubInfoCard";
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
      
      <Tabs defaultValue="reference" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="reference" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Reference Materials
          </TabsTrigger>
          <TabsTrigger value="club" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Radio Club
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Emergency Info
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reference" className="mt-0">
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
                  category !== "Powell River Amateur Radio Club" && (
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
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-lg text-gray-500">No reference items found matching your search.</p>
                <p className="text-sm text-muted-foreground mt-2">Try different search terms or clear your search</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="club" className="mt-0">
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 text-primary">Powell River Amateur Radio Club</h2>
            <ClubInfoCard />
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-700 mb-2">Why Join The Club?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  The Powell River Amateur Radio Club is a vibrant community of radio enthusiasts who share knowledge, 
                  participate in events, and support each other in the exciting world of amateur radio. 
                  Whether you're a beginner or an experienced operator, you'll find valuable resources and 
                  friendly faces at our meetings and activities.
                </p>
                <p className="text-sm font-medium text-gray-700">
                  New members are always welcome! Join us at our next meeting or coffee meetup.
                </p>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="text-lg font-medium text-amber-700 mb-2">Stay Connected</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you're a fan of amateur radio or looking to get involved in the Powell River area, 
                  you'll be happy to know that the Powell River Amateur Radio Club is buzzing with activity. 
                  From community events to educational programs, there's always something happening in and 
                  around the club.
                </p>
                <div className="mt-3 p-3 bg-white rounded-md">
                  <h4 className="font-medium text-amber-600 mb-1">Social Gatherings</h4>
                  <p className="text-sm text-gray-700">
                    Join us for coffee on Saturday mornings at 10am at the local A&W. 
                    It's a great chance to relax, have fun, and strengthen bonds outside of the radio shack.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="emergency" className="mt-0">
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 text-primary">Emergency Communications</h2>
            
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i}>
                    <Skeleton className="h-10 w-full mb-3 rounded" />
                    <Skeleton className="h-24 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Filter and display only emergency protocols */}
                {referenceItems
                  .filter(item => item.category === "Emergency Protocols")
                  .map(item => (
                    <ReferenceItem 
                      key={item.id} 
                      item={item} 
                      isEmergency={true} 
                    />
                  ))
                }
                
                <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-700 mb-3">When All Else Fails: Ham Radio Works</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    During emergencies when conventional communications infrastructure may be compromised, 
                    amateur radio operators play a crucial role in maintaining communications. The Powell River 
                    Amateur Radio Club regularly practices emergency communication protocols to stay prepared.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h4 className="font-medium text-red-600">Emergency Frequency</h4>
                      <p className="mt-1">146.52 MHz (National Calling)</p>
                    </div>
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h4 className="font-medium text-red-600">Emergency Contact</h4>
                      <p className="mt-1">Club Repeater or 604-485-6916</p>
                    </div>
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h4 className="font-medium text-red-600">Priority Traffic</h4>
                      <p className="mt-1">Use "emergency" for life-threatening situations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferencePage;
