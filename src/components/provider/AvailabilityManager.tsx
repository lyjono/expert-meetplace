
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getProviderAvailability, addAvailabilitySlot, deleteAvailabilitySlot, AvailabilitySlot } from "@/services/availability";
import { X } from "lucide-react";

interface AvailabilityManagerProps {
  providerId: string;
}

const AvailabilityManager = ({ providerId }: AvailabilityManagerProps) => {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    day_of_week: "1", // Monday by default
    start_time: "09:00",
    end_time: "17:00"
  });

  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const fetchAvailability = async () => {
    setLoading(true);
    const slots = await getProviderAvailability(providerId);
    setAvailabilitySlots(slots);
    setLoading(false);
  };

  useEffect(() => {
    fetchAvailability();
  }, [providerId]);

  const handleAddSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time) {
      toast.error("Please set both start and end times");
      return;
    }

    // Check if end time is after start time
    if (newSlot.start_time >= newSlot.end_time) {
      toast.error("End time must be after start time");
      return;
    }

    const success = await addAvailabilitySlot({
      provider_id: providerId,
      day_of_week: parseInt(newSlot.day_of_week),
      start_time: newSlot.start_time,
      end_time: newSlot.end_time
    });

    if (success) {
      toast.success("Availability slot added");
      fetchAvailability();
    } else {
      toast.error("Failed to add availability slot");
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const success = await deleteAvailabilitySlot(slotId);
    if (success) {
      toast.success("Availability slot removed");
      setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== slotId));
    } else {
      toast.error("Failed to remove availability slot");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Availability</CardTitle>
        <CardDescription>
          Set the days and times when you're available for appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Current Availability:</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading availability...</p>
            ) : availabilitySlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No availability slots set. Add your first one below.</p>
            ) : (
              <div className="space-y-2">
                {availabilitySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                    <div>
                      <span className="font-medium">{dayNames[slot.day_of_week]}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSlot(slot.id)}
                      aria-label="Remove availability slot"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Add New Availability:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Day</label>
                <Select
                  value={newSlot.day_of_week}
                  onValueChange={(value) => setNewSlot({ ...newSlot, day_of_week: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Start Time</label>
                <Input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">End Time</label>
                <Input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddSlot}>Add Availability Slot</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
