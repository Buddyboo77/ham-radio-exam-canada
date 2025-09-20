import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Radio, AlertTriangle, Search, Bookmark, Users, Shield, Music, GraduationCap, Home } from "lucide-react";
import ReferenceItem from "@/components/reference/ReferenceItem";
import ClubInfoCard from "@/components/reference/ClubInfoCard";
import EnhancedMorseCode from "@/components/reference/EnhancedMorseCode";
import HamLicenseGuide from "@/components/reference/HamLicenseGuide";
import { ReferenceItem as ReferenceItemType } from "@shared/schema";
import { Link } from "wouter";

const ReferencePage = () => {
  const [activeTab, setActiveTab] = useState<string>("license");
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
    <div className="p-2">
      {/* Radio display readout for Reference mode */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="radio-led green"></div>
            <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">
              Ham Radio Reference
            </h2>
          </div>
          <Link href="/">
            <button 
              className="text-xs text-green-300 hover:text-green-100 font-mono bg-green-900 px-2 py-0.5 rounded border border-green-800 flex items-center gap-1"
              data-testid="button-home"
            >
              <Home size={10} /> HOME
            </button>
          </Link>
        </div>
      </div>
      
      {/* Tab Navigation as Radio Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <button
          className={`radio-channel ${activeTab === 'license' ? 'active' : ''}`}
          onClick={() => setActiveTab('license')}
        >
          <GraduationCap size={12} className="mr-1" /> License Guide
        </button>
        <button
          className={`radio-channel ${activeTab === 'morse' ? 'active' : ''}`}
          onClick={() => setActiveTab('morse')}
        >
          <Music size={12} className="mr-1" /> Morse Code
        </button>
        <button
          className={`radio-channel ${activeTab === 'reference' ? 'active' : ''}`}
          onClick={() => setActiveTab('reference')}
        >
          <Book size={12} className="mr-1" /> References
        </button>
        <button
          className={`radio-channel ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          <AlertTriangle size={12} className="mr-1" /> Emergency
        </button>
      </div>
      
      {/* Content area with radio screen styling */}
      <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 border border-gray-700">
        {/* Search bar styled like a frequency input */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            type="text" 
            placeholder="Search reference materials..." 
            className="pl-8 bg-gray-800 border-gray-700 text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Reference Materials Tab */}
        {activeTab === 'reference' && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <Skeleton className="h-8 w-full mb-2 rounded bg-gray-700" />
                    <Skeleton className="h-20 w-full rounded bg-gray-700" />
                  </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="space-y-5">
                {sortedCategories.map(category => (
                  category !== "Powell River Amateur Radio Club" && (
                    <div key={category} className="bg-gray-800 rounded-md p-3 border border-gray-700">
                      <h2 className="text-base font-bold mb-3 pb-1 border-b border-gray-600 text-blue-300 flex items-center">
                        <Bookmark size={14} className="mr-2" /> {category}
                      </h2>
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
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="font-medium text-gray-300">No reference items found</h3>
                <p className="mt-1 text-gray-500 text-sm">
                  {searchTerm ? "Try different search terms" : "No matching references available"}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Club Info Tab */}
        {activeTab === 'club' && (
          <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
            <div className="flex items-center mb-3 pb-1 border-b border-gray-600">
              <Radio size={15} className="mr-2 text-blue-400" />
              <h2 className="text-base font-bold text-blue-300">Powell River Amateur Radio Club</h2>
            </div>
            
            <ClubInfoCard />
            
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-blue-900 bg-opacity-30 rounded-md border border-blue-800">
                <h3 className="text-sm font-medium text-blue-300 mb-2">Why Join The Club?</h3>
                <p className="text-xs text-gray-300">
                  The Powell River Amateur Radio Club is a vibrant community of radio enthusiasts who share knowledge, 
                  participate in events, and support each other in the exciting world of amateur radio. 
                  Whether you're a beginner or an experienced operator, you'll find valuable resources and 
                  friendly faces at our meetings and activities.
                </p>
                <p className="text-xs font-medium text-gray-100 mt-2">
                  New members are always welcome! Join us at our next meeting or coffee meetup.
                </p>
              </div>
              
              <div className="p-3 bg-amber-900 bg-opacity-20 rounded-md border border-amber-800">
                <h3 className="text-sm font-medium text-amber-300 mb-2">Stay Connected</h3>
                <p className="text-xs text-gray-300">
                  If you're a fan of amateur radio or looking to get involved in the Powell River area, 
                  you'll be happy to know that the Powell River Amateur Radio Club is buzzing with activity. 
                  From community events to educational programs, there's always something happening.
                </p>
                <div className="mt-2 p-2 bg-gray-800 rounded-md border border-gray-700">
                  <h4 className="font-medium text-amber-400 text-xs mb-1">Social Gatherings</h4>
                  <p className="text-xs text-gray-300">
                    Join us for coffee on Saturday mornings at 10am at the local A&W. 
                    It's a great chance to relax, have fun, and strengthen bonds outside of the radio shack.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* License Guide Tab */}
        {activeTab === 'license' && (
          <HamLicenseGuide />
        )}
        
        {/* Morse Code Tab */}
        {activeTab === 'morse' && (
          <EnhancedMorseCode />
        )}
        
        {/* Emergency Info Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
              <div className="flex items-center mb-3 pb-1 border-b border-gray-600">
                <Shield size={15} className="mr-2 text-red-500" />
                <h2 className="text-base font-bold text-red-300">Emergency Communications</h2>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i}>
                      <Skeleton className="h-8 w-full mb-2 rounded bg-gray-700" />
                      <Skeleton className="h-20 w-full rounded bg-gray-700" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
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
                </div>
              )}
            </div>
            
            <div className="p-3 bg-red-900 bg-opacity-20 rounded-md border border-red-800">
              <h3 className="text-sm font-semibold text-red-300 mb-2">When All Else Fails: Ham Radio Works</h3>
              <p className="text-xs text-gray-300 mb-3">
                During emergencies when conventional communications infrastructure may be compromised, 
                amateur radio operators play a crucial role in maintaining communications. The Powell River 
                Amateur Radio Club regularly practices emergency communication protocols to stay prepared.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                  <h4 className="font-medium text-red-400 mb-1">Emergency Frequency</h4>
                  <p className="text-gray-300">146.52 MHz (National Calling)</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                  <h4 className="font-medium text-red-400 mb-1">Emergency Contact</h4>
                  <p className="text-gray-300">Club Repeater or 604-485-6916</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                  <h4 className="font-medium text-red-400 mb-1">Priority Traffic</h4>
                  <p className="text-gray-300">Use "emergency" for life-threatening situations</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferencePage;
