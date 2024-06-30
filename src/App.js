import logo from './logo.svg';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RegistrationForm from './Components/Form';

function App() {
  return (
    <div className="App ">
      <RegistrationForm />
      <ToastContainer />

    </div>

  );
}

export default App;
