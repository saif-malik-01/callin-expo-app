 import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { RTCView, MediaStream, RTCSessionDescription } from "react-native-webrtc";
import ConnectionManager from "../hooks/ConnectionManager";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  CallScreen: { contactUid: string; contactEmail: string; isCaller: boolean };
};


type Props = NativeStackScreenProps<RootStackParamList, "CallScreen">;
const CallOption = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.optionContainer}>
    <View style={styles.optionCircle}>
      <Text style={styles.optionIcon}>{icon}</Text>
    </View>
    <Text style={styles.optionLabel}>{label}</Text>
  </View>
);

const CallScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contactUid,isCaller } = route.params;
const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<
    "incoming" | "connecting" | "connected" | "ended" | "error" | "idle"
  >(isCaller ? "connecting" : "incoming");
const { contactEmail} = route.params;


  const [errorMessage, setErrorMessage] = useState<string>("");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const socket = ConnectionManager.socket;
  const peerConnection = ConnectionManager.peerConnection;

  // Clean up connection and exit screen
  const cleanupAndExit = () => {
    ConnectionManager.reset();
    navigation.goBack();
  };

  // Accept the incoming call
  const acceptCall = async () => {
    if (!peerConnection) {
      setCallStatus("error");
      setErrorMessage("Peer connection not initialized");
      return;
    }

    try {
      setCallStatus("connecting");

      const offer = ConnectionManager.offer;
      if (!offer) throw new Error("No offer to accept");

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: false,
      });

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("answer", { answer, from: ConnectionManager.userId, to: contactUid });

      // Setup event listeners only once
      peerConnection.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, to: contactUid });
        }
      });

      peerConnection.addEventListener("track", (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      });

      setCallStatus("connected");
    } catch (error: any) {
      setCallStatus("error");
      setErrorMessage(error.message || "Accept call failed");
    }
  };

  // Reject the call
  const rejectCall = () => {
    socket.emit("end-call", { to: contactUid });
    setCallStatus("ended");
    cleanupAndExit();
  };

  // End call manually
  const endCall = () => {
    socket.emit("end-call", { to: contactUid });
    setCallStatus("ended");
    cleanupAndExit();
  };
useEffect(() => {
  let timer: NodeJS.Timeout;

  if (callStatus === "connected") {
    timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }

  return () => {
    if (timer) clearInterval(timer);
  };
}, [callStatus]);

  useEffect(() => {
    if (!peerConnection) {
      setCallStatus("error");
      setErrorMessage("Peer connection not initialized");
      return;
    }

    
    const onConnectionStateChange = () => {
     



      const state = peerConnection.connectionState;
      if (state === "connected") {
        setCallStatus("connected");
      } else if (["disconnected", "failed", "closed"].includes(state)) {
        setCallStatus("ended");
        cleanupAndExit();
      }
    };

    peerConnection.addEventListener("connectionstatechange", onConnectionStateChange);

   
    const onEndCall = () => {
      setCallStatus("ended");
      cleanupAndExit();
    };

    socket.on("end-call", onEndCall);

   
    return () => {
      peerConnection.removeEventListener("connectionstatechange", onConnectionStateChange);
      socket.off("end-call", onEndCall);
     
    };
  }, [peerConnection, socket,callStatus]);
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

  return (
    <View style={styles.container}>
      {!isCaller && callStatus === "incoming" && (
        <>
          <Text style={styles.callerText}>Incoming call from {contactUid}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={acceptCall}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={rejectCall}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

    {callStatus === "connecting" && (
  <View style={styles.connectingContainer}>
    <View style={styles.avatar} />
    <Text style={styles.connectingName}>{contactEmail}</Text>
    <Text style={styles.connectingText}>Connecting</Text>
    <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 20 }} />
  </View>
)}

    {callStatus === "connected" && (
  <View style={styles.callUIContainer}>
   
   <Text style={styles.callDuration}>{formatTime(callDuration)}</Text>

    <View style={styles.avatar} />
  <Text style={styles.phoneNumber}>{contactEmail ?? "Unknown Contact"}</Text>


   
    {remoteStream && (
      <RTCView
        streamURL={remoteStream.toURL()}
        style={styles.rtcView}
        objectFit="cover"
      />
    )}

   
    <View style={styles.row}>
      <CallOption icon="🔊" label="speaker" />
      <CallOption icon="🎤" label="mute" />
      <CallOption icon="📼" label="record" />
    </View>
    <View style={styles.row}>
      <CallOption icon="📹" label="video" />
      <CallOption icon="🔢" label="keypad" />
      <CallOption icon="⏸️" label="hold" />
    </View>

  
    <TouchableOpacity style={styles.declineButton} onPress={endCall}>
      <Text style={styles.declineText}>Decline</Text>
    </TouchableOpacity>
  </View>
)}

      {callStatus === "ended" && <Text style={styles.statusText}>Call Ended</Text>}

      {callStatus === "error" && (
        <Text style={[styles.statusText, { color: "red" }]}>Error: {errorMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  callerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f0",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 40,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  center: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    marginTop: 20,
    color: "#fff",
    textAlign: "center",
  },
  video: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  endCallButton: {
    marginTop: 30,
    backgroundColor: "#f44336",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 40,
  },
  endCallText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  callUIContainer: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "linear-gradient(to bottom, #6a11cb, #2575fc)", // requires gradient lib or fallback to "#6a11cb"
  padding: 20,
},
callDuration: {
  fontSize: 24,
  color: "#fff",
  marginBottom: 10,
},
avatar: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: "#ccc",
  marginBottom: 10,
},

phoneNumber: {
  fontSize: 18,
  color: "#fff",
  marginBottom: 30,
},
rtcView: {
  width: "90%",
  height: 200,
  borderRadius: 12,
  backgroundColor: "#000",
  marginBottom: 20,
},

row: {
  flexDirection: "row",
  justifyContent: "space-around",
  width: "100%",
  marginVertical: 10,
},
declineButton: {
  marginTop: 30,
  backgroundColor: "#f44336",
  padding: 15,
  borderRadius: 40,
  width: 80,
  alignItems: "center",
},
declineText: {
  color: "#fff",
  fontWeight: "bold",
},
optionContainer: {
  alignItems: "center",
  marginHorizontal: 10,
},

optionCircle: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#ffffff40",
  justifyContent: "center",
  alignItems: "center",
},

optionIcon: {
  fontSize: 24,
},

optionLabel: {
  color: "#fff",
  fontSize: 12,
  marginTop: 5,
},
connectingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  backgroundColor: "#121212",
},

connectingName: {
  fontSize: 22,
  color: "#fff",
  fontWeight: "600",
  marginVertical: 20,
},

connectingText: {
  fontSize: 18,
  color: "#aaa",
  marginTop: 10,
},



});

export default CallScreen;