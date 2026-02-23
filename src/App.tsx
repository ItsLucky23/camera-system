import { useEffect, useState, useRef  } from "react";
import createConnection from "./socket";

const secret = 'a'
// const secret = 'keetlerop'

function App() {

  // const [allowed, setAllowed] = useState<Boolean>(false);
  // const [password, setPassword] = useState<string>("");
  const [screen, setScreen] = useState<string | undefined>();
  const fpsCount = useRef(0);

  // useEffect(() => {
  //   if (!allowed) { return; }
  //   console.log('connecting socket')
  //   createConnection({ setScreen, fpsCount });
  // }, [allowed])

  useEffect(() => {
    const socket = createConnection({ setScreen, fpsCount });

    return () => {
      socket.close();
    };
  }, [])

  useEffect(() => {
    return () => {
      if (screen) {
        URL.revokeObjectURL(screen);
      }
    };
  }, [screen]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('count', fpsCount.current);
      fpsCount.current = 0;
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  // if (!allowed) {
  //   return (
  //     <div className="w-full h-full flex items-center justify-center">
  //       <input
  //         onChange={(e) => {
  //           const value = e.target.value;
  //           setPassword(value);
  //           if (value == secret) { setAllowed(true); }
  //         }}
  //         value={password}
  //         placeholder="Enter valid password"
  //         type="password"
  //         className="rounded-md bg-white border text-black border-black p-2"
  //       >
  //       </input>
  //     </div>
  //   )
  // }

  return (
    <div className='w-full h-full flex items-center justify-center flex-col gap-2 font-semibold text-3xl'>
      <h1>ESP32 CAM</h1>
      <img
        src={screen}>
      </img>
      {/* <img
        src={`data:image/jpeg;base64,${screen}`}>
      </img> */}
      {/* <canvas
      
      >
      </canvas> */}
    </div>
  )
}

export default App
