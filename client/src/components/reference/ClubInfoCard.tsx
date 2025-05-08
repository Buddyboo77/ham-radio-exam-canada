import React from 'react';
import { 
  CalendarDays,
  Coffee,
  Users,
  Radio,
  BookOpen,
  MapPin,
  PhoneCall
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const ClubInfoCard = () => {
  return (
    <Card className="w-full overflow-hidden border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white pb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">Powell River Amateur Radio Club</CardTitle>
            <CardDescription className="text-blue-100 mt-1">Connecting radio enthusiasts since 1972</CardDescription>
          </div>
          <Badge className="bg-amber-500 text-white hover:bg-amber-600">Active Community</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-medium">Club Meetings</h3>
              <p className="text-sm text-gray-600">September-June on the second Wednesday at 7:00pm</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700">
            <PhoneCall className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-medium">Access Information</h3>
              <p className="text-sm text-gray-600">Call on the repeater or 604-485-6916 to gain access</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Coffee className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-medium">Weekly Coffee Meetup</h3>
              <p className="text-sm text-gray-600">Saturday mornings at 10am at the local A&W</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center text-blue-700 mb-2">
              <Users className="h-5 w-5 mr-2" />
              Community Events
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              The Powell River Amateur Radio Club is known for its active involvement in the local community. 
              Members regularly participate in events to showcase equipment and educate the community about 
              amateur radio's importance, especially in emergency situations.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Annual Emergency Preparedness Expo participation</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Regular field days for radio setup practice and socializing</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Public demonstrations and community awareness events</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center text-green-700 mb-2">
              <BookOpen className="h-5 w-5 mr-2" />
              Educational Programs
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              The club is committed to fostering learning and growth within the amateur radio community. 
              They regularly organize workshops and training sessions for both beginners and experienced operators.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-green-500">•</span>
                <span>Digital mode workshops covering FT8, PSK31, and RTTY</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">•</span>
                <span>Antenna design and construction workshops</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">•</span>
                <span>Emergency communication protocol training</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 px-6 py-4 border-t">
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Find Location
        </Button>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Radio className="h-4 w-4" />
          Contact Club
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClubInfoCard;