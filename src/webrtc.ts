import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
// console.log(import.meta.env.RENDERER_VITE_SUPABASE_URL);

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const channel = client.channel("signaling-server");

channel
  .on("broadcast", { event: "signal" }, ({ payload }) => {
    console.log(payload);
    if (payload.offer) {
      // Handle incoming offer
      handleOffer(payload.offer);
    } else if (payload.ice_candidate) {
      // Handle incoming ICE candidate
      handleIceCandidate(payload.ice_candidate);
    } else if (payload.answer) {
      // Handle incoming answer
      handleAnswer(payload.answer);
    }
  })
  .subscribe();

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const peerConnection = new RTCPeerConnection(configuration);
peerConnection.addEventListener("connectionstatechange", (_) => {
  if (peerConnection.connectionState === "connected") {
    // Peers connected!
    console.log("connected");
  }
});

const dataChannel = peerConnection.createDataChannel("clipboard");

dataChannel.addEventListener("message", (event) => {
  console.log(event.data);
});

// Set up offer/answer negotiation
export async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  // Send the offer to the other peer through Supabase
  channel.send({
    type: "broadcast",
    event: "signal",
    payload: { offer: peerConnection.localDescription },
  });
}

// createOffer();

peerConnection.onicecandidate = (event) => {
  console.log("onicecandidate");
  if (event.candidate) {
    // Send the ICE candidate to the other peer through Supabase
    channel.send({
      type: "broadcast",
      event: "signal",
      payload: { ice_candidate: event.candidate },
    });
  }
};

// Function to handle incoming offer
async function handleOffer(offer: RTCSessionDescriptionInit) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  // Create an answer
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  // Send the answer to the other peer through Supabase
  channel.send({
    type: "broadcast",
    event: "signal",
    payload: { answer: peerConnection.localDescription },
  });
}

// Function to handle incoming ICE candidate
async function handleIceCandidate(
  iceCandidate: RTCIceCandidateInit | undefined
) {
  await peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
}

async function handleAnswer(answer: RTCSessionDescriptionInit) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}
