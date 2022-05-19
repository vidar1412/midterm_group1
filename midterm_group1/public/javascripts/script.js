const socket = io("/");
const videoDisplay = document.getElementById("video-display-here");
const myVideoDisplay = document.getElementById("my-video");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "8000",
  // secure: true,
  // host: "0.peerjs.com",
  // port: 443,
});

var localStream;

const myVideo = document.createElement("video");
myVideo.className = "myVideo mh-25";
myVideo.muted = true;

const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    localStream = stream;
    addMyVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userID) => {
      connectToNewUser(userID, stream);
      setTimeout(connectToNewUser, 1000, userID, stream);
    });
  });

socket.on("user-disconnected", (userID) => {
  if (peers[userID]) {
    peers[userID].close();
  }
});

myPeer.on("open", (id) => {
  socket.emit("join-room", roomID, id);
});

function connectToNewUser(userID, stream) {
  const call = myPeer.call(userID, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userID] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  //console.log("appedn");
  videoDisplay.append(video);
}

function addMyVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  myVideoDisplay.append(video);
}
