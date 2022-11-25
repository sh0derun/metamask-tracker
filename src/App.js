import './App.css';
import styled from 'styled-components';

function handleLogin(){
  console.log(window.etheriu);
}

function App() {
  return (
    <div className="App"> 
        <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default App;
