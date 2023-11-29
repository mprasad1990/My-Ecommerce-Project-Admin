import './App.css';
import Core from './components/Core';
import LoginState from './context/login/LoginState';

function App() {
  return (
    <>
      <LoginState>
        <Core/>
      </LoginState>
    </>
  );
}

export default App;
