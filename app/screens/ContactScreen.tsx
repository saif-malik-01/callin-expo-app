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
import { onAuthStateChanged } from "firebase/auth";
import {  firestore, functions } from "../../firebaseConfig";
import auth from "@react-native-firebase/auth";
import { useNavigation } from '@react-navigation/native';
import AddContactModal from "../components/AddContactModal";
import EditContactModal from "../components/EditContactModal";
import ContactItem from "../components/ContactItem";
import SearchBar from "../components/SearchBar";
import FAB from "../components/FAB";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ConnectionManager from "../hooks/ConnectionManager";
type RootStackParamList = {
  ContactsScreen: undefined;
  CallScreen: { contactUid: string; contactEmail: string,isCaller: boolean };
};

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  onPress?: () => void;
}

const SOCKET_URL = "https://callin-signaling-server-2bmm.onrender.com"; // Replace with actual server

const ContactsScreen = () => {
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const nameInputRef = useRef<TextInput | null>(null);

  const socket = ConnectionManager.socket;

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

 
  useEffect(() => {
    console.log("Mounting ContactsScreen");
   const unsubscribe = auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    setUserId(user.uid);
  } else {
    console.log("No user logged in");
    setUserId(null);
  }
});

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (!socket.connected) {
    console.log("Connecting socket...");
    socket.connect();
  }
        const handleConnect = () => {
      console.log("Socket connected, emitting register");
      socket.emit("register", { userId });
    };


   socket.on("connect", handleConnect);

    socket.on("offer", async ({ offer, from }) => {
      try {
         if (from === userId) {
    
    return;
  }
          console.log("[socket] Received offer from:", from);
             navigation.navigate("CallScreen", { contactUid: from, contactEmail: "", isCaller: false });
       const peerConnection = ConnectionManager.getOrCreatePeerConnection(configuration);


        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const stream = await mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) =>
          peerConnection?.addTrack(track, stream)
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", { answer, from: userId, to: from });
console.log("[socket] Sent answer from:", userId, "to:", from);
        peerConnection.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: from,
            });
          }
        });

        peerConnection.addEventListener("track", (event) => {
          console.log("Remote track received", event.track);
        });

        setIsCalling(true);
      } catch (error) {
        console.error("Offer Error:", error);
        resetCall();
      }
    });

    socket.on("answer", async ({ answer,from }) => {
      try {
         console.log("[socket] Received answer from:", from);
        const peerConnection = ConnectionManager.peerConnection;
      if (!peerConnection) throw new Error("No peer connection available");

    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Answer Error:", error);
        resetCall();
      }
    });

    socket.on("ice-candidate", async ({ candidate,from }) => {
      try {
         console.log("[socket] Received ICE candidate from:", from);
         const peerConnection = ConnectionManager.peerConnection;
      if (!peerConnection) throw new Error("No peer connection available");

        await peerConnection?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("ICE Error:", error);
      }
    });

    socket.on("end-call", resetCall);
console.log("User ID for fetching contacts:", userId);
    fetchContacts();
socket.on("error", (msg) => console.error("[Socket Error]:", msg));

    return () => {
      socket.off("connect", handleConnect);
       socket.off("offer");
  socket.off("answer");
  socket.off("ice-candidate");
  socket.off("end-call");
      resetCall();
    };
  }, [userId]);

  const resetCall = () => {
  ConnectionManager.reset();
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
  if (!userId) return;
   console.log("Fetching contacts for userId:", userId);

  try {
    
    const contactsCol = collection(firestore, "users", userId, "contacts");
    const snapshot = await getDocs(contactsCol);

    const fetchedContacts: Contact[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Contact, "id" | "onPress">),
      onPress: () => {},
    }));
console.log("Fetched contacts:", fetchedContacts);

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
      if (!userId) return;

    try {
      const contactRef = await addDoc(collection(firestore, "users", userId, "contacts"), {
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
      await updateDoc(doc(firestore, "users", userId!, "contacts", id), {
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
      await deleteDoc(doc(firestore, "users", userId!, "contacts", id));
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

    const emailToSearch = contact.email.trim().toLowerCase();
    console.log("Searching user by email:", emailToSearch);
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("email", "==", emailToSearch));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      Alert.alert("User not found", "This user is not registered.");
      return;
    }

   
    const userDoc = querySnapshot.docs[0];
    const contactUid = userDoc.id;
    console.log("Found user with UID:", contactUid);

    
    const peerConnection = ConnectionManager.getOrCreatePeerConnection(configuration);


    const stream = await mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    const offer = await peerConnection.createOffer({});
    await peerConnection.setLocalDescription(offer);
 console.log("Emitting offer from:", userId, "to:", contactUid);
    socket.emit("offer", {
      offer,
      from: userId,
      to: contactUid,
    });

    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
          console.log("Sending ICE candidate from:", userId, "to:", contactUid);
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: contactUid,
        });
      }
    });

    setIsCalling(true);
     navigation.navigate("CallScreen", {
        contactUid: contactUid,
        contactEmail: contact.email,
        isCaller: true,
      });

   
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
