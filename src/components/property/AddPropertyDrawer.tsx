
'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AddPropertyForm } from './AddPropertyForm';
import { useIsMobile } from '@/hooks/use-mobile';

export function AddPropertyDrawer() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSuccess = () => {
    setOpen(false);
    navigate('/land');
  };

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-full h-full p-0 m-0">
          <div className="h-full overflow-y-auto">
            <AddPropertyForm onSuccess={handleSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <div className="h-full overflow-y-auto p-6">
          <AddPropertyForm onSuccess={handleSuccess} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
