import React, { useEffect, useRef, useState } from 'react';
import { Button, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import {
    mediaDevices,
    MediaStream,
    RTCIceCandidate,
    RTCPeerConnection,
    RTCPeerConnectionIceEvent,
    RTCSessionDescription,
    RTCTrackEvent,
    RTCView,
} from 'react-native-webrtc';
import io from 'socket.io-client';



const SIGNALING_SERVER_URL = 'http://ip:3000'; //to be replaced by ip of the server
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const CallScreen = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);

  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(configuration));
  const socket = useRef(io(SIGNALING_SERVER_URL)).current;

  useEffect(() => {
    const getPermissions = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      }
    };

    getPermissions();
    init();

    return () => {
      socket.disconnect();
      pc.current.close();
    };
  }, []);

  const init = async () => {
    const stream = await mediaDevices.getUserMedia({ audio: true });
    setLocalStream(stream);

    stream.getTracks().forEach(track => {
      pc.current.addTrack(track, stream);
    });

    const remoteMediaStream = new MediaStream();
    setRemoteStream(remoteMediaStream);

    pc.current.ontrack = (event: RTCTrackEvent) => {
      // Handle the event where the remote stream is added to the connection
      event.streams[0]?.getTracks().forEach(track => {
        remoteMediaStream.addTrack(track);
      });
    };

    socket.on('offer', async ({ sdp }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.current.createAnswer({});
      await pc.current.setLocalDescription(answer);
      socket.emit('answer', { sdp: answer });
    });

    socket.on('answer', async ({ sdp }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (candidate) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    pc.current.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate });
      }
    };
  };

  const startCall = async () => {
    const offer = await pc.current.createOffer({});
    await pc.current.setLocalDescription(offer);
    socket.emit('offer', { sdp: offer });
    setConnected(true);
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setConnected(false);
  };

  const toggleMute = () => {
    const audioTrack = localStream?.getAudioTracks?.()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VoIP Call</Text>
      <View style={styles.buttons}>
        {!connected ? (
          <Button title="Start Call" onPress={startCall} />
        ) : (
          <Button title="Hang Up" onPress={endCall} color="red" />
        )}
        {connected && (
          <Button title={muted ? 'Unmute' : 'Mute'} onPress={toggleMute} />
        )}
      </View>
      <Text style={styles.label}>Local Audio</Text>
      {localStream && <RTCView streamURL={localStream.toURL()} style={styles.rtc} />}
      <Text style={styles.label}>Remote Audio</Text>
      {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={styles.rtc} />}
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rtc: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
    marginTop: 10,
  },
});