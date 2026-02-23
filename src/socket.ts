import { Dispatch, SetStateAction } from "react";

interface Props {
  setScreen: Dispatch<SetStateAction<string | undefined>>
  fpsCount: any
}

export default function createConnection({ setScreen, fpsCount }: Props) {
  // const socket = new WebSocket('ws://192.168.178.68:8090');
  const socket = new WebSocket('ws://192.168.178.248:8090');
  socket.binaryType = 'arraybuffer'; 

  socket.addEventListener('open', () => {
    console.log('Connected to WebSocket server');
    socket.send(JSON.stringify({ socketType: 'client', request: 'getVideo' }))
  });

  socket.addEventListener('message', (event) => {
    if (!(event.data instanceof ArrayBuffer)) {
      return;
    }

    const blob = new Blob([event.data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    setScreen(url);
    fpsCount.current++;
  });

  socket.addEventListener('close', () => {
    console.log('Disconnected from server');
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
}