import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MicOff, Mic, VideoOff, Video, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onEndCall: () => void;
}

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
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        };
        peerConnectionRef.current = new RTCPeerConnection(configuration);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach(track => {
          peerConnectionRef.current?.addTrack(track, stream);
        });

        peerConnectionRef.current.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsConnected(true);
            setIsConnecting(false);
            toast.success("Connected to call");
          }
        };

        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate:', event.candidate);
            channelRef.current?.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'candidate', candidate: event.candidate },
            });
          }
        };

        peerConnectionRef.current.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', peerConnectionRef.current?.iceConnectionState);
          if (peerConnectionRef.current?.iceConnectionState === 'failed') {
            toast.error('Connection failed. Please try again.');
            setIsConnecting(false);
          }
        };

        peerConnectionRef.current.onsignalingstatechange = () => {
          console.log('Signaling state:', peerConnectionRef.current?.signalingState);
        };

        setupSignaling(roomId);

      } catch (error) {
        console.error("Error initializing video call:", error);
        setPermissionsError("Could not initialize video call. Please try again.");
        toast.error("Could not initialize video call");
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      cleanup();
    };
  }, [roomId]);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
  };

  const setupSignaling = (roomId: string) => {
    const channel = supabase.channel(`video-call:${roomId}`);

    channel.on('broadcast', { event: 'signal' }, (payload) => {
      console.log('Received signal:', payload.payload);
      const { type, candidate, data } = payload.payload;
      if (type === 'offer') {
        handleOffer(data);
      } else if (type === 'answer') {
        handleAnswer(data);
      } else if (type === 'candidate') {
        handleCandidate(candidate);
      }
    });

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const users = Object.values(presenceState).flat().map((entry: any) => entry.user);
      console.log('Users in room:', users);
      if (users.length === 2 && users[0] === userName) { // First user creates offer
        console.log(`${userName} is initiating the call`);
        createOffer();
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to signaling channel:', `video-call:${roomId}`);
        // Track presence after subscription
        await channel.track({ user: userName });
      }
    });

    channelRef.current = channel;
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnectionRef.current?.createOffer();
      await peerConnectionRef.current?.setLocalDescription(offer);
      console.log('Sending offer:', offer);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: { type: 'offer', data: offer },
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Failed to create offer");
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      console.log('Sending answer:', answer);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: { type: 'answer', data: answer },
      });
    } catch (error) {
      console.error("Error handling offer:", error);
      toast.error("Failed to handle offer");
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error handling answer:", error);
      toast.error("Failed to handle answer");
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
      toast.error("Failed to add ICE candidate");
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
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <div className="text-center">
              <p className="text-xl mb-2">Connecting to call...</p>
              <p className="text-sm text-slate-300">Waiting for peer connection</p>
            </div>
          </div>
        )}

        {permissionsError && (
          <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-500/80 text-white px-4 py-2 rounded-md text-sm">
            {permissionsError}
          </div>
        )}

        <div className="absolute bottom-4 right-4 w-1/4 h-1/4 rounded-md overflow-hidden border-2 border-primary shadow-lg">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {isVideoOff && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <p className="text-white text-xs">Camera Off</p>
            </div>
          )}
        </div>
      </div>

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
          <PhoneOff className="h-5 w-5 mr-2" /> End Call
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;