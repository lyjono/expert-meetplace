
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MicOff, Mic, VideoOff, Video, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onEndCall: () => void;
}

// Simple WebRTC implementation for direct peer-to-peer video calls
export const VideoCall: React.FC<VideoCallProps> = ({ roomId, userName, onEndCall }) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Configure and initialize WebRTC connection
  useEffect(() => {
    const initCall = async () => {
      try {
        // Create peer connection with STUN servers for NAT traversal
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        };
        
        peerConnectionRef.current = new RTCPeerConnection(configuration);
        
        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        localStreamRef.current = stream;
        
        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });
        
        // Handle remote track reception
        peerConnectionRef.current.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsConnected(true);
            setIsConnecting(false);
            toast.success("Connected to call");
          }
        };
        
        // Set up signaling using Supabase Realtime
        setupSignaling(roomId);
        
      } catch (error) {
        console.error("Error initializing video call:", error);
        toast.error("Could not access camera or microphone");
        setIsConnecting(false);
        onEndCall();
      }
    };
    
    initCall();
    
    // Cleanup function
    return () => {
      cleanup();
    };
  }, [roomId]);
  
  const cleanup = () => {
    // Stop all tracks and clean up
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };
  
  const setupSignaling = (roomId: string) => {
    // This is a simplified implementation
    // In a real application, you would use a signaling server
    // Here we're just simulating the basic process
    
    // Using a timer to simulate connection success
    const timer = setTimeout(() => {
      if (!isConnected) {
        toast.error("Could not connect to peer, trying to simulate peer connection");
        simulatePeerConnection();
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  };
  
  const simulatePeerConnection = async () => {
    try {
      if (peerConnectionRef.current) {
        // Create a simple offer
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        // In a real app, this would be sent to the other peer through a signaling server
        console.log("Created offer:", offer);
        
        // Simulate receiving an answer
        setTimeout(() => {
          setIsConnecting(false);
          toast.info("No peer connected. Video call is ready but waiting for peer to join.");
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Failed to establish connection");
      setIsConnecting(false);
    }
  };
  
  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };
  
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  const handleEndCall = () => {
    cleanup();
    onEndCall();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative bg-muted rounded-md overflow-hidden">
        {/* Remote Video (full size) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Status message overlay (connecting) */}
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <div className="text-center">
              <p className="text-xl mb-2">Connecting to {roomId}...</p>
              <p className="text-sm text-slate-300">Waiting for peer connection</p>
            </div>
          </div>
        )}
        
        {/* Local Video (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-1/4 h-1/4 rounded-md overflow-hidden border-2 border-primary shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted // Always mute local video to prevent feedback
            className="w-full h-full object-cover"
          />
          
          {/* Optional overlay when video is off */}
          {isVideoOff && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <p className="text-white text-xs">Camera Off</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-4 flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMicrophone}
          className={isMicMuted ? "bg-red-100 text-red-600" : ""}
        >
          {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="outline" 
          size="icon"
          onClick={toggleVideo}
          className={isVideoOff ? "bg-red-100 text-red-600" : ""}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        
        <Button variant="destructive" onClick={handleEndCall}>
          <PhoneOff className="h-5 w-5 mr-2" />
          End Call
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
