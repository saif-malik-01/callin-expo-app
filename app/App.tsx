import React, { useEffect, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import {
  mediaDevices,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";
import io from "socket.io-client";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const socket = io("https://callin-signaling-server.onrender.com");

export default function Index() {
  const [userId] = useState("user1"); // Hardcoded for demo
  const [recipientId] = useState("user2"); // Target user
  const [isCalling, setIsCalling] = useState(false);
  let peerConnection: RTCPeerConnection | null = null;

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("register", userId);
    });

    socket.on("offer", async ({ offer, from }) => {
      try {
        peerConnection = new RTCPeerConnection(configuration);
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const stream = await mediaDevices.getUserMedia({ audio: true });
        stream
          .getTracks()
          .forEach((track) => peerConnection?.addTrack(track, stream));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", { answer, from: userId, to: from });

        peerConnection.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: from,
            });
          }
        });

        peerConnection.addEventListener("track", () => {
          // Audio is handled by WebRTC
        });

        setIsCalling(true);
      } catch (error) {
        console.error("Offer Error:", error);
        resetCall();
      }
    });

    socket.on("answer", async ({ answer }) => {
      try {
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Answer Error:", error);
        resetCall();
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("ICE Error:", error);
      }
    });

    socket.on("end-call", () => {
      resetCall();
    });

    return () => {
      if (socket) socket.disconnect();
      resetCall();
    };
  }, []);

  const startCall = async () => {
    try {
      peerConnection = new RTCPeerConnection(configuration);

      const stream = await mediaDevices.getUserMedia({ audio: true });
      stream
        .getTracks()
        .forEach((track) => peerConnection?.addTrack(track, stream));

      const offer = await peerConnection.createOffer({});
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", { offer, from: userId, to: recipientId });

      peerConnection.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: recipientId,
          });
        }
      });

      peerConnection.addEventListener("track", () => {
        // Audio is handled by WebRTC
      });

      setIsCalling(true);
    } catch (error) {
      console.error("Start Call Error:", error);
      resetCall();
    }
  };

  const endCall = () => {
    socket.emit("end-call", { to: recipientId });
    resetCall();
  };

  const resetCall = () => {
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    setIsCalling(false);
  };

  return (
    <View style={styles.container}>
      <Button
        title={isCalling ? "Disconnect" : "Call User 1"}
        onPress={isCalling ? endCall : startCall}
        color={isCalling ? "#6c757d" : "#007bff"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});
