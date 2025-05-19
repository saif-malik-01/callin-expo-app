import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from "react-native-webrtc";
import io from "socket.io-client";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, firestore, functions } from "../../firebaseConfig";

import AddContactModal from "../components/AddContactModal";
import EditContactModal from "../components/EditContactModal";
import ContactItem from "../components/ContactItem";
import SearchBar from "../components/SearchBar";
import FAB from "../components/FAB";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  onPress?: () => void;
}

const SOCKET_URL = "http://your-server-ip:3000"; // Replace with actual server

const ContactsScreen = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const nameInputRef = useRef<TextInput | null>(null);

  const socket = useRef(io(SOCKET_URL)).current;
  const userId = auth.currentUser?.uid;  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("register", userId);
    });

    socket.on("offer", async ({ offer, from }) => {
      try {
        peerConnectionRef.current = new RTCPeerConnection(configuration);

        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const stream = await mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) =>
          peerConnectionRef.current?.addTrack(track, stream)
        );

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit("answer", { answer, from: userId, to: from });

        peerConnectionRef.current.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: from,
            });
          }
        });

        peerConnectionRef.current.addEventListener("track", (event) => {
          console.log("Remote track received", event.track);
          
        });

        setIsCalling(true);
      } catch (error) {
        console.error("Offer Error:", error);
        resetCall();
      }
    });

    socket.on("answer", async ({ answer }) => {
      try {
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Answer Error:", error);
        resetCall();
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("ICE Error:", error);
      }
    });

    socket.on("end-call", resetCall);

    fetchContacts();

    return () => {
      socket.disconnect();
      resetCall();
    };
  }, []);

  const resetCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsCalling(false);
  };

  const resetInputs = () => {
    setNewName("");
    setNewPhone("");
    setNewEmail("");
  };

  const openAddContactModal = () => setAddContactOpen(true);
  const closeAddContactModal = () => {
    setAddContactOpen(false);
    resetInputs();
  };

  const fetchContacts = async () => {
    try {
      const q = query(
        collection(firestore, "contacts"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);

      const fetchedContacts: Contact[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        onPress: () => {},
      })) as Contact[];

      setContacts(fetchedContacts);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };

  const saveContact = async (name: string, phone: string, email: string) => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert("Error", "Please enter name, phone number, and email.");
      return;
    }

    try {
      const contactRef = await addDoc(collection(firestore, "contacts"), {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        userId,
      });

      const newContact: Contact = {
        id: contactRef.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        onPress: () => {},
      };

      setContacts([...contacts, newContact]);
      closeAddContactModal();
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const updateContact = async (id: string, name: string, phone: string) => {
    try {
      await updateDoc(doc(firestore, "contacts", id), {
        name,
        phone,
      });

      const updated = contacts.map((c) =>
        c.id === id ? { ...c, name, phone } : c
      );
      setContacts(updated);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "contacts", id));
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleCallPress = async (contact: Contact) => {
    try {
      if (!contact.email) {
        Alert.alert("Error", "This contact doesn't have an email.");
        return;
      }

      const getUserIdByEmail = httpsCallable(functions, "getUserIdByEmail");
      const res = await getUserIdByEmail({ email: contact.email });
      const contactUid = (res.data as { uid: string }).uid;

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      const stream = await mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer({});
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", {
        offer,
        from: userId,
        to: contactUid,
      });

      peerConnection.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: contactUid,
          });
        }
      });

      setIsCalling(true);
    } catch (err) {
      console.error("Call Error:", err);
      Alert.alert("Call Failed", "Could not find this user's UID.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ marginTop: 30, paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Contacts</Text>
      </View>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <FlatList
        data={contacts.filter((contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactItem
            contact={item}
            onPress={() => {
              setSelectedContact(item);
              setEditContactOpen(true);
            }}
            onCallPress={handleCallPress}
          />
        )}
        ListEmptyComponent={<Text>No contacts found.</Text>}
      />

      <FAB onPress={openAddContactModal} />

      <AddContactModal
        visible={addContactOpen}
        onClose={closeAddContactModal}
        onSave={saveContact}
        newName={newName}
        newPhone={newPhone}
        newEmail={newEmail}
        setNewName={setNewName}
        setNewPhone={setNewPhone}
        setNewEmail={setNewEmail}
        nameInputRef={nameInputRef}
      />

      {selectedContact && (
        <EditContactModal
          visible={editContactOpen}
          onClose={() => setEditContactOpen(false)}
          contact={selectedContact}
          onSave={updateContact}
          onDelete={deleteContact}
        />
      )}
    </SafeAreaView>
  );
};

export default ContactsScreen;
