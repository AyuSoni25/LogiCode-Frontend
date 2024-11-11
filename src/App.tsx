import { Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import SideBar from './components/SideBar';
import SampleProblem1 from './constants/SampleProblem1';
import ProblemDescription from './pages/Description/ProblemDescription';
import ProblemList from './pages/ProblemList/ProblemList';
import { useEffect, useState } from 'react';
import { socket } from './config/socket';

function App() {

  const markdownText = SampleProblem1.problemStatement;

  const [isConnected, setIsConnected] = useState(socket.connected);
  const userId = '1';

  useEffect(() => {
    function onConnect() {
      console.log('Web socket connection established.')
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    if(isConnected){
      console.log('emitting events');
      socket.emit('setUserId', userId);
      socket.emit('getConnectionId', userId);
    }

    socket.on('connectionId', (data) => {
        console.log("Connection Id:", data);
    });

    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [isConnected]);

  return (
    <div className='h-[100vh] overflow-hidden'>
      <Navbar />
      <SideBar />
      <Routes>
        <Route path='/problems/list' element={<ProblemList />} />
        <Route path='/problem' element={ <ProblemDescription descriptionText={markdownText} />} />
      </Routes>
    </div>
  );
}

export default App;
