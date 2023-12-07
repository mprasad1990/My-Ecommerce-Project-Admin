import './App.css';
import Core from './components/Core';
import LoaderState from './context/loader/LoaderState';
import LoginState from './context/login/LoginState';
import AlertState from './context/alert/AlertState';

function App() {
  return (
    <>
      <LoginState>
        <LoaderState>
        <AlertState>
          <Core/>
        </AlertState>
        </LoaderState>
      </LoginState>
    </>
  );
}

export default App;
