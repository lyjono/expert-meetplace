
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  participantName: string;
}

const VideoCall: React.FC<VideoCallProps> = ({
  isOpen,
  onClose,
  roomId,
  participantName
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && roomId) {
      initializeMedia();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, roomId]);

  const initializeMedia = async () => {
    try {
      setIsConnecting(true);
      
      // Request access to camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // In a real app, we would connect to a WebRTC service here
      // For this demo, we'll just simulate connection
      setTimeout(() => {
        setIsConnecting(false);
        toast.success(`Connected to room: ${roomId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera or microphone');
      setIsConnecting(false);
    }
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[600px]">
        <DialogHeader>
          <DialogTitle>Video Call with {participantName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 relative bg-muted rounded-md overflow-hidden">
            {isConnecting ? (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="mb-2">Connecting to {participantName}...</p>
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              </div>
            ) : (
              <>
                <video 
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay 
                  playsInline 
                />
                <div className="absolute bottom-5 right-5 w-1/4 h-1/4 bg-accent rounded-md border overflow-hidden">
                  <video 
                    ref={localVideoRef}
                    className="w-full h-full object-cover mirror"
                    autoPlay 
                    playsInline 
                    muted 
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 flex justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => toast.info('Microphone toggled')}
            >
              Toggle Mic
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast.info('Camera toggled')}
            >
              Toggle Camera
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleEndCall}
            >
              End Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCall;
