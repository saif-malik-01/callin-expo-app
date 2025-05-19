import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  View
} from "react-native";
import AddContactModal from "../components/AddContactModal";
import ContactItem from "../components/ContactItem";
import EditContactModal from "../components/EditContactModal";
import FAB from "../components/FAB";
import SearchBar from "../components/SearchBar";

const SOCKET_URL = "http://your-server-ip:3000";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  onPress: () => void;
}

const ContactsScreen = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const nameInputRef = useRef<TextInput | null>(null);
 
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

  const resetInputs = () => {
    setNewName("");
    setNewPhone("");
    setNewEmail("");
  };

  const openAddContactModal = () => {
    setAddContactOpen(true);
  };

  const closeAddContactModal = () => {
    setAddContactOpen(false);
    resetInputs();
  };

  const saveContact = async (name: string, phone: string, email: string) => {
    const nameTrimmed = name.trim();
    const phoneTrimmed = phone.trim();
    const emailTrimmed = email.trim();

    if (!nameTrimmed || !phoneTrimmed || !emailTrimmed) {
      Alert.alert("Error", "Please enter name, phone number, and email.");
      return;
    }

    const newContact = {
      id: uuid.v4().toString(),
      name: nameTrimmed,
      phone: phoneTrimmed,
      email: emailTrimmed,
      onPress: () => {},
    };

    const updated = [...contacts, newContact];
    await saveContacts(updated);
    setContacts(updated);
    closeAddContactModal();
  };

  const updateContact = (id: string, name: string, phone: string) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === id ? { ...contact, name, phone } : contact
    );
    saveContacts(updatedContacts);
    setContacts(updatedContacts);
  };

  const deleteContact = (id: string) => {
    const updatedContacts = contacts.filter((contact) => contact.id !== id);
    saveContacts(updatedContacts);
    setContacts(updatedContacts);
  };

  const handleCallPress = async (contact: Contact) => {
    const message = `Calling ${contact.name}...\nID: ${contact.id}\nEmail: ${
      contact.email ?? "No email available"
    }`;
    Alert.alert("Calling", message);

    try {
      
    } catch (err) {
      console.error("Failed to log call:", err);
    }
  };

  const contact = {
    id:"user1",
    name:"Saif",
    phone:"34",
    email:"sd"
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ marginTop: 30, paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Contacts</Text>
      </View>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <ContactItem
        contact={contact}
        onPress={() => {
          setSelectedContact(contact);
          setEditContactOpen(true);
        }}
        onCallPress={handleCallPress}
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
