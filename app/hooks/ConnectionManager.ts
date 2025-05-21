
import { RTCPeerConnection } from "react-native-webrtc";
import { Socket, io } from "socket.io-client";

const SOCKET_URL = "https://callin-signaling-server-2bmm.onrender.com";

class ConnectionManager {
  private _peerConnection: RTCPeerConnection | null = null;
  public socket: Socket;

  constructor() {
    this.socket = io(SOCKET_URL, { autoConnect: false });
  }

  get peerConnection(): RTCPeerConnection | null {
    return this._peerConnection;
  }

  getOrCreatePeerConnection(config: RTCConfiguration): RTCPeerConnection {
    if (!this._peerConnection) {
      this._peerConnection = new RTCPeerConnection(config);
    }
    return this._peerConnection;
  }

  reset(): void {
    if (this._peerConnection) {
      this._peerConnection.getSenders().forEach((sender) => sender.track?.stop());
      this._peerConnection.close();
      this._peerConnection = null;
    }
  }
}

export default new ConnectionManager();
