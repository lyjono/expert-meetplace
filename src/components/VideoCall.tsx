
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MicOff, Mic, VideoOff, Video, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onEndCall: () => void;
}

// Enhanced WebRTC implementation with better error handling for permissions
export const VideoCall: React.FC<VideoCallProps> = ({ roomId, userName, onEndCall }) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Configure and initialize WebRTC connection with better error handling
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
        
        // Try to get user media with both audio and video
        try {
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
        } catch (mediaError: any) {
          console.error("Media permission error:", mediaError);
          
          // Try fallback to video-only if audio failed
          if (mediaError.name === 'NotReadableError' || 
              mediaError.name === 'NotAllowedError' ||
              mediaError.message.includes('audio')) {
            
            try {
              // Fallback to video only
              const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false 
              });
              
              localStreamRef.current = videoOnlyStream;
              
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = videoOnlyStream;
              }
              
              // Add video-only tracks to peer connection
              videoOnlyStream.getTracks().forEach(track => {
                if (peerConnectionRef.current) {
                  peerConnectionRef.current.addTrack(track, videoOnlyStream);
                }
              });
              
              setIsMicMuted(true);
              setPermissionsError("Microphone access denied. Video call will proceed without audio.");
              toast.warning("Microphone access denied. Video call will proceed without audio.");
            } catch (videoError) {
              // Both audio and video failed
              console.error("Video permission error:", videoError);
              setPermissionsError("Camera and microphone access required for video calls.");
              toast.error("Camera and microphone access required for video calls.");
              setIsConnecting(false);
              return;
            }
          }
        }
        
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
        setPermissionsError("Could not initialize video call. Please try again.");
        toast.error("Could not initialize video call");
        setIsConnecting(false);
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
        toast.info("Could not connect to peer, waiting for someone to join");
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
      if (audioTracks.length === 0) {
        toast.error("No microphone available");
        return;
      }
      
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
              <p className="text-xl mb-2">Connecting to call...</p>
              <p className="text-sm text-slate-300">Waiting for peer connection</p>
            </div>
          </div>
        )}
        
        {/* Permissions error message */}
        {permissionsError && (
          <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-500/80 text-white px-4 py-2 rounded-md text-sm">
            {permissionsError}
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
          disabled={localStreamRef.current?.getAudioTracks().length === 0}
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
