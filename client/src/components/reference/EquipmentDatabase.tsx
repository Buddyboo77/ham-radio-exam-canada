import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Radio, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Star, 
  StarOff,
  Bookmark,
  ExternalLink,
  InfoIcon
} from 'lucide-react';

// Equipment database
const EQUIPMENT_DATA = {
  transceivers: [
    {
      id: 1,
      name: 'IC-7300',
      manufacturer: 'Icom',
      type: 'HF/6m Transceiver',
      frequency_range: '0.5-74.8 MHz',
      power_output: '100W',
      modes: ['SSB', 'CW', 'RTTY', 'AM', 'FM'],
      features: ['SDR', 'Touch Screen', 'USB', 'Spectrum Scope'],
      year: 2016,
      image: 'https://www.icomamerica.com/en/products/amateur/hf/7300/images/7300-website.jpg'
    },
    {
      id: 2,
      name: 'TS-590SG',
      manufacturer: 'Kenwood',
      type: 'HF/6m Transceiver',
      frequency_range: '0.13-60 MHz',
      power_output: '100W',
      modes: ['SSB', 'CW', 'FSK', 'PSK', 'AM', 'FM'],
      features: ['DSP', 'USB', 'Multiple Filters'],
      year: 2014,
      image: 'https://www.kenwood.com/usa/com/amateur/ts-590sg/images/ts-590sg_h.jpg'
    },
    {
      id: 3,
      name: 'FT-991A',
      manufacturer: 'Yaesu',
      type: 'HF/VHF/UHF Transceiver',
      frequency_range: '0.1-450 MHz',
      power_output: '100W (HF), 50W (VHF/UHF)',
      modes: ['SSB', 'CW', 'AM', 'FM', 'DIGITAL'],
      features: ['Touch Screen', 'C4FM Digital', 'USB', '3DSS'],
      year: 2015,
      image: 'https://www.yaesu.com/usa/product_resources/FT-991A.jpg'
    },
    {
      id: 4,
      name: 'FT-817ND',
      manufacturer: 'Yaesu',
      type: 'HF/VHF/UHF Portable',
      frequency_range: '0.1-450 MHz',
      power_output: '5W',
      modes: ['SSB', 'CW', 'AM', 'FM', 'DIGITAL'],
      features: ['Portable', 'Battery Operation', 'All Band', 'QRP'],
      year: 2007,
      image: 'https://www.yaesu.com/usa/product_resources/FT-817ND.jpg'
    },
    {
      id: 5,
      name: 'IC-705',
      manufacturer: 'Icom',
      type: 'HF/VHF/UHF Portable',
      frequency_range: '0.5-148 MHz',
      power_output: '10W',
      modes: ['SSB', 'CW', 'AM', 'FM', 'DIGITAL'],
      features: ['SDR', 'Touch Screen', 'Portable', 'Bluetooth', 'DSTAR'],
      year: 2020,
      image: 'https://www.icomamerica.com/en/products/amateur/hf/705/images/705-website.jpg'
    }
  ],
  antennas: [
    {
      id: 1,
      name: 'X7',
      manufacturer: 'Cushcraft',
      type: 'Tribander Yagi',
      frequency_range: '14/21/28 MHz',
      gain: '9/9/9 dBi',
      length: '32 ft',
      elements: 7,
      features: ['High Gain', 'Trapped', 'Rotatable'],
      year: 2010,
      image: 'https://www.cushcraftamateur.com/Product%20Pictures/X7.jpg'
    },
    {
      id: 2,
      name: 'G5RV',
      manufacturer: 'Various',
      type: 'Dipole',
      frequency_range: '3.5-28 MHz',
      gain: '0 dBi',
      length: '102 ft',
      elements: 1,
      features: ['Multi-band', 'Wire', 'Simple'],
      year: 1946,
      image: 'https://www.dxengineering.com/cms/global/assets/product_images/mfj_enterprises/MFJ-1778X.jpg'
    },
    {
      id: 3,
      name: 'X510',
      manufacturer: 'Diamond',
      type: 'Vertical',
      frequency_range: '144/430 MHz',
      gain: '8.3/11.7 dBi',
      length: '17.2 ft',
      elements: 2,
      features: ['Dual-band', 'Fiberglass', 'Base Station'],
      year: 2000,
      image: 'https://diamondantenna.net/images/X510.jpg'
    },
    {
      id: 4,
      name: 'Buddipole',
      manufacturer: 'Buddipole',
      type: 'Portable Dipole',
      frequency_range: '7-30 MHz',
      gain: '0-2.15 dBi',
      length: 'Variable',
      elements: 2,
      features: ['Portable', 'Modular', 'Quick Setup'],
      year: 2002,
      image: 'https://www.buddipole.com/store/image/cache/catalog/Buddipole%20images/stndrd-buddipole-1280x720.jpg'
    },
    {
      id: 5,
      name: 'End-Fed Half Wave',
      manufacturer: 'Various',
      type: 'End-Fed Wire',
      frequency_range: '3.5-28 MHz',
      gain: '0 dBi',
      length: 'Variable',
      elements: 1,
      features: ['Multi-band', 'Low Profile', 'Single Support'],
      year: 2005,
      image: 'https://www.dxengineering.com/cms/global/assets/product_images/palomar_engineers/HS-9-3-1-FCON-2KU-1.jpg'
    }
  ],
  accessories: [
    {
      id: 1,
      name: 'MFJ-998',
      manufacturer: 'MFJ',
      type: 'Auto Tuner',
      specs: '1.8-30 MHz, 1500W',
      features: ['Automatic', 'High Power', 'Wide Range', 'Digital'],
      year: 2008,
      image: 'https://www.mfjenterprises.com/Product%20Pictures/MFJ-998.jpg'
    },
    {
      id: 2,
      name: 'SignaLink USB',
      manufacturer: 'Tigertronics',
      type: 'Sound Card Interface',
      specs: 'USB, Isolation',
      features: ['Digital Modes', 'RTTY', 'FT8', 'USB Powered'],
      year: 2007,
      image: 'https://www.tigertronics.com/images/main/signalinku.jpg'
    },
    {
      id: 3,
      name: 'MFJ-269C',
      manufacturer: 'MFJ',
      type: 'Antenna Analyzer',
      specs: '1.8-230 MHz, SWR/R/X',
      features: ['Portable', 'Battery', 'LCD Display', 'Wide Range'],
      year: 2015,
      image: 'https://www.mfjenterprises.com/Product%20Pictures/MFJ-269C.jpg'
    },
    {
      id: 4,
      name: 'LDG AT-1000 ProII',
      manufacturer: 'LDG',
      type: 'Auto Tuner',
      specs: '1.8-54 MHz, 1000W',
      features: ['Automatic', 'High Power', 'Memory', 'Wide Range'],
      year: 2015,
      image: 'https://ldgelectronics.com/assets/images/AT-1000ProII-Web.jpg'
    },
    {
      id: 5,
      name: 'Icom SM-50',
      manufacturer: 'Icom',
      type: 'Desktop Microphone',
      specs: 'Unidirectional, Dynamic',
      features: ['Up/Down Buttons', 'Low Cut', 'Desktop'],
      year: 2000,
      image: 'https://www.icomamerica.com/en/products/accessories/desktop/sm50/images/sm50.jpg'
    }
  ]
};

interface EquipmentItemProps {
  item: any;
  category: string;
  favorite: boolean;
  onToggleFavorite: (id: number, category: string) => void;
}

function EquipmentItem({ 
  item, 
  category, 
  favorite, 
  onToggleFavorite 
}: EquipmentItemProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {item.name}
              <Badge variant="outline" className="font-normal">
                {item.manufacturer}
              </Badge>
            </CardTitle>
            <CardDescription>
              {item.type}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(item.id, category)}
            className="h-8 w-8"
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? 
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : 
              <StarOff className="h-4 w-4 text-gray-400" />
            }
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[500px]' : 'max-h-24'}`}>
          <div className="flex gap-4 mb-3">
            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
              {item.image ? (
                <div className="text-xs text-center p-2 text-gray-400">
                  [Image would load here]
                </div>
              ) : (
                <Radio className="w-12 h-12 text-gray-300" />
              )}
            </div>
            
            <div className="flex-1">
              <Table>
                <TableBody>
                  {Object.entries(item)
                    .filter(([key]) => !['id', 'name', 'manufacturer', 'type', 'image', 'features'].includes(key))
                    .map(([key, value]) => (
                      <TableRow key={key} className="border-0">
                        <TableCell className="py-1 pl-0 font-medium text-xs capitalize">
                          {key.replace('_', ' ')}:
                        </TableCell>
                        <TableCell className="py-1 text-xs">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {item.features && (
            <div className="mt-3">
              <div className="text-xs font-medium mb-1">Features:</div>
              <div className="flex flex-wrap gap-1">
                {item.features.map((feature: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="More information">
            <InfoIcon className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Open manufacturer website">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Save to equipment list">
            <Bookmark className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function EquipmentDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('transceivers');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<{[key: string]: number[]}>({
    transceivers: [],
    antennas: [],
    accessories: []
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleToggleFavorite = (id: number, category: string) => {
    setFavorites(prev => {
      const newFavorites = { ...prev };
      
      if (newFavorites[category].includes(id)) {
        newFavorites[category] = newFavorites[category].filter(itemId => itemId !== id);
      } else {
        newFavorites[category] = [...newFavorites[category], id];
      }
      
      return newFavorites;
    });
  };
  
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };
  
  // Filter and sort equipment data
  const filteredData = EQUIPMENT_DATA[selectedCategory as keyof typeof EQUIPMENT_DATA]
    .filter(item => {
      const lowercaseSearch = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(lowercaseSearch) ||
        item.manufacturer.toLowerCase().includes(lowercaseSearch) ||
        item.type.toLowerCase().includes(lowercaseSearch) ||
        (item.features && item.features.some((f: string) => 
          f.toLowerCase().includes(lowercaseSearch)
        ))
      );
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Radio className="mr-2 h-5 w-5 text-blue-500" />
          Ham Radio Equipment Database
        </h2>
        <p className="text-sm text-gray-500">
          Browse transceivers, antennas, and accessories with detailed specifications.
        </p>
      </div>
      
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
        
        <Button variant="outline" size="icon" title="Filter options">
          <Filter className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          title="Sort options"
          onClick={() => handleSort(sortBy)}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transceivers">Transceivers</TabsTrigger>
          <TabsTrigger value="antennas">Antennas</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
        </TabsList>
        
        {Object.keys(EQUIPMENT_DATA).map(category => (
          <TabsContent key={category} value={category} className="mt-3">
            <ScrollArea className="h-[460px] pr-4">
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <EquipmentItem 
                    key={item.id}
                    item={item}
                    category={category}
                    favorite={favorites[category]?.includes(item.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No equipment found matching your search criteria.
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}